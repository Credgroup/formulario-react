import { type ColunaType, type FieldType } from "../../core/types";
import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "../ui/dialog";
import TableGridContainer from "./TableGridContainer";
import GenericField from "../GenericField";
import TableGridContainerExpanded from "./TableGridContainerExpanded";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { LucideLoader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { dev_log } from "@/lib/utils";

type TableFieldProps = {
  field: Partial<FieldType>;
  onValueChange: (value: string) => void;
  onSave?: (value: string) => void; 
  restFields?: Partial<FieldType>[];
  onHandleFileUpload?: (item: any) => void  
};

export function TableField({ field, onValueChange, onSave, restFields,  onHandleFileUpload = ()=>{return} }: Readonly<TableFieldProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRowValues, setNewRowValues] = useState<Record<string, string>>({});
  const [colunasState, setColunasState] = useState<ColunaType[]>([]);
  const [conteudoState, setConteudoState] = useState("");
  const [colunasPreview, setColunasPreview] = useState<any[]>([]);
  const [conteudoValido, setConteudoValido] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingUploading, setIsLoadingUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadJson, setUploadJson] = useState<any[] | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRemoveAllModal, setShowRemoveAllModal] = useState(false);

  useEffect(() => {
    // Só inicializa se ainda não estiverem definidos
    if (colunasState.length === 0 && Array.isArray(field.colunas)) {
      setColunasState(field.colunas);
    }
    if (!conteudoState && field.conteudo) {
      setConteudoState(field.conteudo);
    }
  }, []);

  useEffect(() => {
    let preview: any[] = [];
    let valido = false;
    try {
      if (conteudoState) {
        const parsed = JSON.parse(conteudoState);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].nmColumn && parsed[0].rows) {
          preview = parsed;
          valido = true;
        }
      }
    } catch {
      // Conteúdo inválido, segue vazio
    }

    setColunasPreview(preview);
    setConteudoValido(valido);
  }, [conteudoState, colunasState]);

  useEffect(() => {
    onValueChange(conteudoState);
  }, [conteudoState]);

  // Verifica se pode adicionar linha
  const podeAdicionarLinha = Array.isArray(colunasState) && colunasState.length > 0;

  const handleNovaLinha = () => {
    setNewRowValues({});
    setShowAddRow(true);
  };

  const handleFieldChange = (id: string | undefined, value: string) => {
    if (!id) return;
    setNewRowValues((prev) => ({ ...prev, [id]: value }));
  };

  const debounceRef = useRef<any | null>(null);

  const handleFieldChangeDebounced = (id: string | undefined, value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      handleFieldChange(id, value); // sua função original
    }, 200);
  };  

  const handleAdicionarLinha = () => {
    let novoConteudo: any[] = [];
    if (conteudoValido) {
      novoConteudo = JSON.parse(conteudoState);
    } else {
      novoConteudo = colunasState.map((col: any) => ({
        nmColumn: col.nome ?? "",
        id: col.id,
        namedTo: "",
        nmColunaTemplate: col.nmColunaTemplate ?? "",
        rows: [],
      }));
    }
    
    // Calcula o próximo índice para colunas contadoras
    const proximoIndice = Math.max(...novoConteudo.map((col: any) => col.rows?.length || 0), 0) + 1;
    
    novoConteudo = novoConteudo.map((col: any) => {
      const colunaField = colunasState.find((c: any) => c.id === col.id);
      const isContador = colunaField?.contador === true;
      
      return {
        ...col,
        rows: [...(col.rows ?? []), isContador ? proximoIndice.toString() : (newRowValues[col.id] || "")]
      };
    });
    
    const novoConteudoStr = JSON.stringify(novoConteudo);
    console.log(novoConteudoStr)
    setConteudoState(novoConteudoStr);
    setShowAddRow(false);
  };

  const handleEditCell = (colId: string, newValue: string, rowIndex: number) => {
    const novoConteudo = colunasPreview.map((c: any) => {
      if (c.id === colId) {
        const novasRows = [...c.rows];
        novasRows[rowIndex] = newValue;
        return { ...c, rows: novasRows };
      }
      return c;
    });
    const novoConteudoStr = JSON.stringify(novoConteudo);
    setConteudoState(novoConteudoStr);
  };

  function getFileType(file: File): string {
    const type = file.type.split("/")[1];
    if (type === "vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      return "xlsx";
    }
    return type;
  }

  // Função para upload real usando fetch
  async function uploadFileToApi(file: File): Promise<any[]> {
    const formData = new FormData();
    const type = getFileType(file);
    formData.append("files", file);
    formData.append("type", type);
    formData.append("limit", field.qtdRespostas?.toString() ?? "-1");
    const PROCESS_FILE_URL_WEBHOOK = field.tableFieldApiUrl ?? "https://devwebhook.keepins.app/webhook/";
    
    dev_log(() => console.log(type))
    dev_log(() => console.log(formData))

    try {
      const response = await fetch(
        `${PROCESS_FILE_URL_WEBHOOK}api/tablefield/processar/arquivo/`,
        {
          method: "POST",
          body: formData,
        }
      );

      // Verifica se a requisição foi bem-sucedida
      if (!response.ok) {
        // Tenta extrair a mensagem de erro do response
        let errorMessage = "Erro ao processar o arquivo na API.";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message ?? errorMessage;
        } catch {
          // Se não conseguir fazer parse do JSON, usa a mensagem padrão ou status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Em caso de sucesso, retorna apenas a resposta da API
      const data = await response.json();
      
            //passando todos os campos para string para evitar problema com replace e corrigindo a data
            const normalizedData = data.map((column: any) => ({
        ...column,
        rows: (column.rows ?? []).map((value: any) => {
          if (
            column.nmColumn === "Data de Nascimento" &&
            typeof value === "number"
          ) {
            const baseDate = new Date(Date.UTC(1899, 11, 30));
            const date = new Date(
              baseDate.getTime() + Math.floor(value) * 86400000
            );

            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
          }
          console.log("testando valor")
          console.log(value)
          return value == null ? "" : String(value);
        }),
      }));

      return normalizedData;
    } catch (err: any) {
      // Se já for um Error com mensagem, apenas relança
      if (err instanceof Error) {
        throw err;
      }
      // Caso contrário, cria um novo erro com mensagem genérica
      throw new Error("Erro ao processar o arquivo na API.");
    }
  }

  // Handler para upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setIsLoadingUploading(true)
    const file = e.target.files?.[0];
    if (!file) return;
    // Valida extensão
    onHandleFileUpload(file)
    const validTypes = ["csv", "xlsx", "xls"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !validTypes.includes(ext)) {
      setUploadError("Arquivo inválido. Envie um arquivo .csv, .xlsx ou .xls");
      return;
    }
    // Chama função de upload real
    try {
      const response = await uploadFileToApi(file);
      if (!Array.isArray(response) || response.length === 0) {
        setUploadError("O arquivo não contém colunas válidas.");
        return;
      }
      setUploadJson(response);
      // Se houver field.colunas, mostrar modal de identificação
      if (Array.isArray(field.colunas) && field.colunas.length > 0) {
        setShowMapModal(true);
      } else {
        // Se não houver, salva direto
        setConteudoState(JSON.stringify(response));
        setIsUploading(false);
      }
    } catch (err: any) {
      setUploadError(err.message ?? "Erro ao processar o arquivo.");
    } finally{
      setIsLoadingUploading(false)
    }
  };

  // Função para verificar se todas as colunas não-contadoras estão mapeadas
  const verificarColunasMapeadas = () => {
    if (!field.colunas) return false;
    
    // Filtra apenas colunas que não são contadoras
    const colunasNaoContadoras = field.colunas.filter((col: any) => !col.contador);
    
    // Verifica se todas as colunas não-contadoras estão mapeadas
    return colunasNaoContadoras.every((col: any) => columnMap[col.id]);
  };

  // Handler para mapear colunas e salvar
  const handleMapAndSave = () => {
    if (!uploadJson || !field.colunas) return;
    
    // Para cada coluna do field, encontra a coluna do upload selecionada
    const mapped = field.colunas.map((col: any) => {
      const isContador = col.contador === true;
      
      if (isContador) {
        // Para colunas contadoras, cria uma coluna com índices sequenciais
        const maxRows = Math.max(...uploadJson.map((c: any) => c.rows?.length || 0), 0);
        const indicesRows = Array.from({ length: maxRows }, (_, index) => (index + 1).toString());
        
        return {
          id: col.id,
          nmColumn: col.nome,
          namedTo: "",
          nmColunaTemplate: col.nmColunaTemplate ?? "",
          rows: indicesRows
        };
      }
      
      const apiColName = columnMap[col.id];
      const apiCol = uploadJson.find((c: any) => c.nmColumn === apiColName);
      if (apiCol) {
        return {
          ...apiCol,
          id: col.id,
          nmColumn: col.nome, // nome do sistema
          namedTo: apiCol.nmColumn, // nome da coluna da API
          nmColunaTemplate: col.nmColunaTemplate ?? ""
        };
      }
      // Se não mapeou, retorna vazio
      return null;
    }).filter(Boolean);
    
    // Garante que mapped é um array de objetos e salva como JSON válido
    const mappedJson = JSON.stringify(mapped, null, 2);
    console.log(mappedJson)
    setConteudoState(mappedJson);  
    setShowMapModal(false);
    setIsUploading(false);
    setUploadJson(null);
    setColumnMap({});
  };

  const handleRemoveAllContent = () => {
    setConteudoState("");
    setIsUploading(false);
    setColunasPreview([])
    setUploadJson(null);
    setColumnMap({});
    setShowRemoveAllModal(false);
  }

  const handleEditColumns = (newColumnsJson: string) => {
    setConteudoState(newColumnsJson)
    setColunasPreview(JSON.parse(newColumnsJson))
  }

  return (
    <div className="w-full">
      {expandido && (
        <TableGridContainerExpanded colunas={colunasPreview.map((col) => ({
          ...col,
          colunaField: colunasState.find((c) => c.id === col.id),
          onEditCell: (newValue: string, rowIndex: number) => handleEditCell(col.id, newValue, rowIndex),
        }))} 
        onBack={() => setExpandido(false)}
        onEditColumns={(json: string) => handleEditColumns(json)}
        />
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal cursor-pointer`}
            onClick={() => setIsOpen(true)}
          >
            <span className={`text-sm text-muted-foreground truncate`}>
              {field.placeholder ?? "Abrir tabela"}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="!max-w-[700px] w-full">
          <DialogHeader>
            <DialogTitle>{field.nome ?? "Tabela"}</DialogTitle>
            <DialogDescription>
              {"Adicione e visualize as informações em formato de tabela."}
            </DialogDescription>
            <div className="flex gap-2 mb-2">
              {podeAdicionarLinha && (
                <Button variant="outline" size="sm" onClick={handleNovaLinha}>
                  Nova linha
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsUploading(true)}>
                Upload
              </Button>
              <Popover open={showRemoveAllModal} onOpenChange={setShowRemoveAllModal}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    Limpar Tabela
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <h2 className="font-bold mb-3">Tem certeza que deseja limpar a tabela?</h2>
                  <div className="w-full flex justify-between">
                    <PopoverClose asChild>
                      <Button variant="outline" size="sm">
                        Cancelar
                      </Button>
                    </PopoverClose>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveAllContent()}>
                      Sim, Limpar Tabela
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </DialogHeader>
          {/* Área de upload */}
          {isUploading ? (
            <div className="flex flex-col items-center justify-center min-h-[250px] w-full border-2 border-dashed border-muted rounded-lg bg-muted/40 p-8 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  fileInputRef.current!.files = e.dataTransfer.files;
                  handleFileUpload({ target: { files: e.dataTransfer.files } } as any);
                }
              }}
              onDragOver={e => e.preventDefault()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div
                className="flex flex-col items-center gap-2 cursor-pointer mb-4"
              >
                <span className="text-lg font-medium text-muted-foreground">Arraste um arquivo ou selecione do seu dispositivo</span>
                <span className="text-xs text-muted-foreground">(Apenas .csv, .xlsx, .xls)</span>
              </div>
              {uploadError && <span className="text-red-500 mt-2">{uploadError}</span>}
              <div className="flex flex-col justify-center items-center gap-2">
                <Button 
                  disabled={isLoadingUploading}
                >
                  Selecionar
                  {
                    isLoadingUploading && <LucideLoader2 className="animate-spin" />
                  }
                </Button>
                <Button variant="ghost" onClickCapture={() => setIsUploading(false)} className="w-full">
                  Cancelar upload
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-h-[200px] flex items-center justify-center w-full relative">
              {conteudoValido ? (
                <div
                  className="group relative w-full h-full max-w-[660px] max-h-[384px] overflow-hidden cursor-pointer border rounded-sm bg-zinc-100/30 hover:shadow-sm transition-shadow"
                  onClick={() => setExpandido(true)}
                >
                  <TableGridContainer
                    colunas={colunasPreview.map((col) => ({
                      ...col,
                      colunaField: colunasState.find((c) => c.id === col.id),
                      onEditCell: (newValue: string, rowIndex: number) => handleEditCell(col.id, newValue, rowIndex)
                    }))}
                    readOnly={true} // Para visualização apenas, use readOnly={true}
                  />
                  {/* Gradiente na base */}
                  <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-zinc-100/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Gradiente na lateral direita */}
                  <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-zinc-100/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <span>Adicione uma linha ou faça upload de arquivo de tabela.</span>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onSave?.(conteudoState); // 👈 só executa se existir
                setIsOpen(false);
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar nova linha */}
      <Dialog open={showAddRow} onOpenChange={setShowAddRow}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] h-fit">
          <DialogHeader>
            <DialogTitle>Adicionar nova linha</DialogTitle>
            <DialogDescription>Preencha os campos para adicionar uma nova linha à tabela.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 h-full">
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col gap-4 p-2">
              {colunasState
                .filter((col: ColunaType) => !col.contador) // Filtra colunas contadoras
                .map((col: ColunaType) => (
              <GenericField
                key={col.id}
                field={{ ...col }}
                restFields={restFields ?? []}
                onValueChange={(value: string) => handleFieldChangeDebounced(col.id, value)}

              />
            ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRow(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdicionarLinha}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de identificação de colunas após upload */}
      {showMapModal && field.colunas && uploadJson && (
        <Dialog open onOpenChange={setShowMapModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Identifique as colunas</DialogTitle>
              <DialogDescription>
                Relacione cada coluna do sistema com a coluna correspondente do arquivo importado.
              </DialogDescription>
            </DialogHeader>
              <ScrollArea  className="h-[300px]">
                <div className="flex flex-col gap-4 py-2">
                  {field.colunas.map((col: any) => {
                    // Opções disponíveis: todas as colunas da API menos as já selecionadas nos outros selects
                    const alreadySelected = Object.entries(columnMap)
                      .filter(([key]) => key !== col.id)
                      .map(([_, val]) => val);
                    const availableApiCols = uploadJson.filter((apiCol: any) => !alreadySelected.includes(apiCol.nmColumn));
                    const isContador = col.contador === true;
                    
                    return (
                      <div key={col.id} className="flex items-center gap-2">
                        <span className="w-48 font-medium text-sm">
                          {col.nome}
                          {isContador && <span className="text-muted-foreground ml-1">(Contador)</span>}
                        </span>
                        <Select
                          value={columnMap[col.id] || ""}
                          onValueChange={val => setColumnMap(prev => ({ ...prev, [col.id]: val }))}
                          disabled={isContador}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder={isContador ? "Preenchido automaticamente" : "Selecione a coluna"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableApiCols.map((apiCol: any) => (
                              <SelectItem key={apiCol.nmColumn} value={apiCol.nmColumn}>
                                {apiCol.nmColumn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
                         <DialogFooter>
               <Button variant="outline" onClick={() => setShowMapModal(false)}>Cancelar</Button>
               <Button 
                 onClick={handleMapAndSave} 
                 disabled={!verificarColunasMapeadas()}
               >
                 Próximo
               </Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}