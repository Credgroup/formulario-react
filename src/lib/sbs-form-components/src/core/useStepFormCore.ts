import { useEffect, useState, useCallback, useRef } from "react";
import type { FieldType, SessaoType } from "./types";
import { useSidebarContext } from "../context/SidebarContext";
import { v4 } from "uuid";
import { useSbsConfigContext } from "../context/SbsConfigContext";

export type onSubimitStepResponse = {
  canContinueForm: boolean
  errors?: string[]
}

export type StepFormConfig = {
  layoutObj: Partial<FieldType>[];
  onBlankLayout: (fields: Partial<FieldType>[]) => void;
  onSubmitStep: (currentSession: Partial<SessaoType>) => Promise<onSubimitStepResponse>;
  onErrorSubmitStep?: (error: onSubimitStepResponse) => void;
  onFinish?: (currentSession: Partial<SessaoType>[]) => void;
  onInit?: (allSessions: Partial<SessaoType>[]) => void;
  onGetLastSessionFilled?: (lastSession: Partial<SessaoType>) => void;
  addLoggerFn?: boolean
};

export const useStepFormCore = ({layoutObj, onSubmitStep, onFinish, onBlankLayout, onInit, onGetLastSessionFilled, onErrorSubmitStep, addLoggerFn = false}: Readonly<StepFormConfig>) => {
  const [sidebar, setSidebar] = useState<Partial<SessaoType>[] | null>(null);
  const sidebarRef = useRef<Partial<SessaoType>[] | null>(null);
  const [currentSessao, setCurrentSessao] = useState<Partial<SessaoType> | null>(null);
  const currentSessaoRef = useRef<Partial<SessaoType> | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Context para scroll automático - opcional para evitar erro quando não está disponível
  let scrollToActiveItem: ((index: number) => void) | null = null;
  try {
    const context = useSidebarContext();
    scrollToActiveItem = context.scrollToActiveItem;
  } catch (error) {
    // Context não disponível, scroll será ignorado
    scrollToActiveItem = () => {};
  }

  // Context para configuração de logs
  let configContext: ReturnType<typeof useSbsConfigContext> | null = null;
  try {
    configContext = useSbsConfigContext();
  } catch (error) {
    // Context não disponível, será verificado na função devLog
    configContext = null;
  }

  useEffect(() => {
    async function init() {

      if (!layoutObj || layoutObj.length === 0) {
        devLog(() => console.log("Layout vazio ou não encontrado. \n\n" + JSON.stringify(layoutObj)));
        onBlankLayout(layoutObj);
        return;
      }

      const filesFields = layoutObj.filter((item) => item.type === "file" && !item.sessao?.trim());
      devLog(() => console.log("filesFields", filesFields));
  
      const camposPorSessao = layoutObj.reduce(
        (acc, campo) => {
          if (campo.type === "file" && !campo.sessao?.trim()) {
            return acc;
          }
          const sessao = campo.sessao?.trim() || "Outros Campos";
  
          if (!acc[sessao]) {
            acc[sessao] = {
              titulo: sessao,
              descricao: "",
              campos: [],
            };
          }
  
          acc[sessao].campos.push(campo);
  
          return acc;
        },
        {} as Record<
          string,
          {
            titulo: string;
            descricao: string;
            campos: Partial<FieldType>[];
          }
        >
      );
  
      const sessoesArray = Object.entries(camposPorSessao).map(       
        ([sessao, data]) => {
          return {
            sessao,
            titulo: findTitleBySessao(data.campos),
            descricao: findDescriptionBySessao(data.campos),
            campos: data.campos,
            active: false,
          };
        }
      );
      console.log("testando sessoesArray")
      console.log(sessoesArray)
      const sidebarItems: Partial<SessaoType>[] = sessoesArray.map((sessao) => ({
        id: v4(),
        title: sessao.titulo ?? sessao.sessao,
        descricao: sessao.descricao,
        checked: false,
        disabled: true,
        campos: sessao.campos,
        typeSession: "input",
      }));
  
      const sessaoOutrosIndex = sidebarItems.findIndex(
        (item) => item.title === "Outros Campos"
      );
  
      // coloca a sessao "Outros Campos" no final
      if (sessaoOutrosIndex !== -1) {
        const sessaoOutros = sidebarItems[sessaoOutrosIndex];
        sessaoOutros.descricao = "Campos complementares ao formulário";
        sidebarItems.splice(sessaoOutrosIndex, 1);
        sidebarItems.push(sessaoOutros);
      }
  
      const filesSessao: Partial<SessaoType> = {
        id: v4(),
        active: false,
        checked: false,
        disabled: true,
        title: "Anexos complementares",
        descricao: "Anexos complementares ao formulário",
        typeSession: "documento",
        campos: filesFields,
      };
  
      const resumeSessao: Partial<SessaoType> = {
        id: v4(),
        active: false,
        checked: false,
        disabled: true,
        title: "Resumo",
        descricao: "Reveja os dados preenchidos antes de enviar",
        typeSession: "resumo",
        campos: [],
      };
  
      // Adiciona a sessão de resumo no final
      if (filesSessao.campos!.length > 0) {
        sidebarItems.push(filesSessao);
      }
      sidebarItems.push(resumeSessao);
      devLog(() => console.log("sidebarItems", sidebarItems))

      let translatedSideBar: Partial<SessaoType>[] = await applyTranslateInLayout(sidebarItems)

      if(translatedSideBar.length == 0){
        translatedSideBar = sidebarItems
      }
  
      devLog(() => console.log("translatedSideBar", translatedSideBar));

      translatedSideBar[0].active = true;
      translatedSideBar[0].disabled = false;

      updateSidebar(translatedSideBar);
      updateCurrentSessao(translatedSideBar[0]);
      triggerUpdateSidebarScroll(0)
      
      identifyLastSessionFilled(translatedSideBar)
      onInit?.(translatedSideBar);
      
      devLog(() => console.log("Sessions array:", sessoesArray))

    }

    init()
  }, []);
  
  // Função facilitadora para manter ref e state sincronizados
  const updateSidebar = useCallback((newValue: Partial<SessaoType>[] | null) => {
    sidebarRef.current = newValue;
    setSidebar(newValue);
  }, []);

  // Função facilitadora para manter ref e state sincronizados do currentSessao
  const updateCurrentSessao = useCallback((newValue: Partial<SessaoType> | null) => {
    currentSessaoRef.current = newValue;
    setCurrentSessao(newValue);
  }, []);

  const handleSelectSessao = (sessao: Partial<SessaoType>) => {
    const currentSidebar = sidebarRef.current;
    devLog(() => console.log("sidebar", currentSidebar))
    if (!currentSidebar) return;

    devLog(() => console.log("selecionando sessao", sessao))

    const updatedSidebar = currentSidebar.map((item) => ({
      ...item,
      disabled: true,
      active: false,
    }));

    const sessaoIndex = updatedSidebar.findIndex((item) => item.id === sessao.id);

    if(sessaoIndex === -1){
      console.error("Sessão não encontrada", sessao)
      return;
    }

    updatedSidebar[sessaoIndex] = {
      ...updatedSidebar[sessaoIndex],
      active: true,
      checked: false,
      disabled: false,
    };
    
    // aplica checked em todas as sessões anteriores
    updatedSidebar.forEach((item, index) => {
      if (index < sessaoIndex) {
        updatedSidebar[index] = {
          ...item,
          checked: true,
        };
      }
    });
    
    devLog(() => console.log("updatedSidebar", updatedSidebar))
    devLog(() => console.log("sessaoIndex", sessaoIndex))

    updateSidebar(updatedSidebar);
    updateCurrentSessao(updatedSidebar[sessaoIndex]);
    triggerUpdateSidebarScroll(sessaoIndex)
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleBackSession = () => {
    const currentSidebar = sidebarRef.current;
    if (currentSidebar && currentSidebar.length > 0) {
      const currentIndex = currentSidebar.findIndex((item) => item.active === true);
      if (hasBackSession()) {

         const previousSession = currentSidebar[currentIndex - 1];

      if (
        previousSession?.campos &&
        previousSession.campos.every(campo => campo.visual === false)
      ) {
        handleSelectSessao(currentSidebar[currentIndex - 2]);
      } else {
        handleSelectSessao(currentSidebar[currentIndex - 1]);
      }
      }
    }
  };

  const handleNextSession = async () => {
    const currentSidebar = sidebarRef.current;
    const currentSession = currentSessaoRef.current;
    if (
      !currentSidebar ||
      currentSidebar.length === 0 ||
      !currentSession ||
      !currentSession.campos
    ) {
      return;
    }

    const onSubmitStepRes = await onSubmitStep?.(currentSession)

    if(!onSubmitStepRes.canContinueForm){
      const errors = onSubmitStepRes.errors ?? [""]
      console.log("algum erro aconteceu: \n" + errors.map(item => item + "\n"))
      onErrorSubmitStep?.(onSubmitStepRes)
      return
    }

    if(hasNextSession()){
      const currentIndex = currentSidebar.findIndex((item) => item.active === true);

      const nextSession = currentSidebar[currentIndex + 1];

      console.log("nextSession", nextSession)
      if (
    nextSession?.campos?.length &&
    nextSession.campos.every(campo => campo.visual === false)
  ) {
    console.log("Passou como mais 2")
    handleSelectSessao(currentSidebar[currentIndex + 2]);
  } else {
    console.log("passou como mais 1")
    handleSelectSessao(currentSidebar[currentIndex + 1]);
  }
    }else{
      onFinish?.(currentSidebar)
    }

  };

  const handleUpdateCurrentSession = () => {
    const currentSidebar = sidebarRef.current;
    const currentSession = currentSessaoRef.current;
    if (
      !currentSidebar ||
      currentSidebar.length === 0 ||
      !currentSession ||
      !currentSession.campos
    ) {
      return;
    }
        
    const updatedSidebar = [...currentSidebar];
    
    // 3. Marca a sessão atual como checked e desativa
    const currentIndex = updatedSidebar.findIndex((item) => item.active === true);
    if (currentIndex !== -1) {
      updatedSidebar[currentIndex] = {
        ...updatedSidebar[currentIndex],
        checked: true,
        active: false,
        disabled: true,
      };
    }

    // 4. Busca a próxima sessão ainda não checada
    const nextUncheckedIndex = updatedSidebar.findIndex(
      (item, index) => !item.checked && index > currentIndex
    );

    // 5. Define o índice de destino
    const targetIndex =
      nextUncheckedIndex !== -1 ? nextUncheckedIndex : updatedSidebar.length - 1;

    // 6. Atualiza todos os itens
    updatedSidebar.forEach((item, index) => {
      updatedSidebar[index] = {
        ...item,
        active: index === targetIndex,
        disabled: index !== targetIndex,
      };
    });

    // 7. Define a nova sessão atual
    updateSidebar(updatedSidebar);
    updateCurrentSessao(updatedSidebar[targetIndex]);
    setFieldError(null);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const hasBackSession = () => {
    const currentSidebar = sidebarRef.current;
    if (currentSidebar && currentSidebar.length > 0) {
      const currentIndex = currentSidebar.findIndex((item) => item.active === true);
      return currentIndex > 0;
    }
    return false;
  };

  const hasNextSession = (index?: number) => {
    const currentSidebar = sidebarRef.current;
    if (currentSidebar && currentSidebar.length > 0) {
      if (index) {
        return index < currentSidebar.length - 1;
      }
      const currentIndex = currentSidebar.findIndex((item) => item.active === true);
      return currentIndex < currentSidebar.length - 1;
    }
    return false;
  };

  const findDescriptionBySessao = (fields: Partial<FieldType>[]) => {
    const found = fields.find((item) => {
      if (item.type == "titulo_subtitulo") {
        return item;
      }
    });
    return found ? found.dsSubtitulo : "(Descrição não encontrada)";
  }

  const findTitleBySessao = (fields: Partial<FieldType>[]) => {
    const found = fields.find((item) => {
      console.log(item)
      if (item.type == "titulo_subtitulo")  {
        return item;
      }
    });

    if (found) {
      return found.dsTitulo;
    }

    let notHaveSession = false;
    fields.forEach((item) => {
      if (item.type !== "titulo_subtitulo" && !item.sessao) {
        notHaveSession = true;
      }
    });

    if (notHaveSession) {
      return "Outros Campos";
    }
  }

  // Função para atualizar campos normais (não-API) - Otimizada
  const updateNormalField = useCallback((campoApi: string, newValue: string) => {
    setSidebar(prevSidebar => {
      if (!prevSidebar) return prevSidebar;
      
      const updated = prevSidebar.map(session => ({
        ...session,
        campos: session.campos?.map(campo => 
          campo.campoApi === campoApi
            ? { ...campo, conteudo: newValue }
            : campo
        )
      }));
      
      // Atualiza o ref também
      sidebarRef.current = updated;
      return updated;
    });
    
    setCurrentSessao(prevCurrentSessao => {
      if (!prevCurrentSessao) return prevCurrentSessao;
      
      const updated = {
        ...prevCurrentSessao,
        campos: prevCurrentSessao.campos?.map(campo => 
          campo.campoApi === campoApi
            ? { ...campo, conteudo: newValue }
            : campo
        )
      };
      
      // Atualiza o ref também
      currentSessaoRef.current = updated;
      return updated;
    });
  }, []);

  // Função para atualizar campos via API (apenas campos com target) - Otimizada
  const updateFieldValue = useCallback((targetName: string, newValue: string) => {
    
    setSidebar(prevSidebar => {
      if (!prevSidebar) return prevSidebar;
      
      const updated = prevSidebar.map(session => ({
        ...session,
        campos: session.campos?.map(campo => 
          // Só atualiza se o campo tem target e o targetName corresponde
          campo.target === targetName
            ? { ...campo, conteudo: newValue }
            : campo
        )
      }));
      
      // Atualiza o ref também
      sidebarRef.current = updated;
      return updated;
    });
    
    setCurrentSessao(prevCurrentSessao => {
      if (!prevCurrentSessao) return prevCurrentSessao;
      
      const updated = {
        ...prevCurrentSessao,
        campos: prevCurrentSessao.campos?.map(campo => 
          // Só atualiza se o campo tem target e o targetName corresponde
          campo.target === targetName
            ? { ...campo, conteudo: newValue }
            : campo
        )
      };
      
      // Atualiza o ref também
      currentSessaoRef.current = updated;
      return updated;
    });
  }, []);

  const identifyLastSessionFilled = (sessions: Partial<SessaoType>[]) => {
    let lastSessionFilled: Partial<SessaoType> | null = null;
    const lastSessionToFirst = [...sessions].reverse()

    lastSessionToFirst.forEach(session => {
      if (session.campos?.some(campo => campo.conteudo)) {
        lastSessionFilled = session;
        return;
      }
    });

    if(lastSessionFilled){
      onGetLastSessionFilled?.(lastSessionFilled);
    }
  }

  const applyTranslateInLayout = async (sidebarItems: Partial<SessaoType>[]) => {
    try {
      devLog(() => console.log("sidebarItems", sidebarItems))
      return []
      // const sidebarItemsCopy = sidebarItems.slice()
      // let stringToTranslate: string = ""
      //   sidebarItemsCopy.forEach(session =>{
      //     session.campos?.forEach(item =>{
      //       if(item.nome){
      //         stringToTranslate += `${item.nome}\n\n`
      //       }
      //     })
      //   })
  
      //   stringToTranslate += "$Br0k3"
  
      //   sidebarItemsCopy.forEach(session =>{
      //     if(session.title){
      //       stringToTranslate += `${session.title}\n\n`
      //     }
      //   })
  
    
      //   dev_log(()=>console.log(stringToTranslate))
        
      //   const languageStoreValue = lngSelected ?? "pt"
      //   dev_log(()=>console.log("lingua selecionada: ", languageStoreValue))
    
      //   const formData = new FormData();
      //   formData.append("q", stringToTranslate);
      //   formData.append("source", "pt");
      //   formData.append("target", languageStoreValue);

      //   const url = VITE_TRANSLATE_URL + "translate"
    
      //   const response = await axios.post(url, formData, {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //   });
    
      //   let [askWords, sessionTitles] = response.data.translatedText.split("$Br0k3")
      //   askWords = askWords.split("\n\n")
      //   sessionTitles = sessionTitles.split("\n\n")
  
      //   sidebarItemsCopy.forEach(session =>{
      //     if(session.title) {
      //       session.title = sessionTitles[0]
      //       sessionTitles.splice(0, 1)
      //     }
      //     session.campos?.forEach(item =>{
      //       if(item.nome){
      //         item.nome = askWords[0]
      //         askWords.splice(0, 1)
      //       }
      //     })
      //   })
  
      //   return sidebarItemsCopy
    } catch (error: any) {
      devLog(() => console.log("Não foi possível traduzir o formulário\n", error.message))
      return []
    }
  }

  const triggerUpdateSidebarScroll = (index: number) => {
    if (sidebarRef.current && sidebarRef.current.length > 0 && currentSessaoRef.current && scrollToActiveItem) {
      setTimeout(() => {
        scrollToActiveItem(index);
      }, 150);
    }
  }

  const devLog = useCallback((log: () => void) => {
    let shouldLog = addLoggerFn;
    
    if (!shouldLog && configContext && 'config' in configContext) {
      shouldLog = configContext.config?.logs ?? false;
    }
    
    if (shouldLog) {
      log()
    }
  }, [configContext, addLoggerFn]);

  return {
    sidebar,
    currentSessao,
    fieldError,
    handleSelectSessao,
    handleBackSession,
    handleNextSession,
    handleUpdateCurrentSession,
    hasBackSession,
    hasNextSession,
    updateFieldValue,
    updateNormalField,
    setSidebar: updateSidebar,
    setCurrentSessao: updateCurrentSessao,
  };
};