import { type ColunaType, type FieldType } from "@/types";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import TableGridContainer from "./TableGridContainer";
import GenericField from "../GenericField";
import TableGridContainerExpanded from "./TableGridContainerExpanded";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dev_log } from "@/lib/utils";
import axios from "axios";

type TableFieldProps = {
  field: Partial<FieldType>;
  onValueChange: (value: string) => void;
  restFields?: Partial<FieldType>[];
};

export default function TableField({ field, onValueChange, restFields }: Readonly<TableFieldProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRowValues, setNewRowValues] = useState<Record<string, string>>({});
  const [colunasState, setColunasState] = useState<ColunaType[]>([]);
  const [conteudoState, setConteudoState] = useState("");
  const [colunasPreview, setColunasPreview] = useState<any[]>([]);
  const [conteudoValido, setConteudoValido] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadJson, setUploadJson] = useState<any[] | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    console.log(colunasState)
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

  const handleAdicionarLinha = () => {
    let novoConteudo: any[] = [];
    if (conteudoValido) {
      novoConteudo = JSON.parse(conteudoState);
    } else {
      novoConteudo = colunasState.map((col: any) => ({
        nmColumn: col.nome ?? "",
        id: col.id,
        namedTo: "",
        rows: [],
      }));
    }
    novoConteudo = novoConteudo.map((col: any) => ({
      ...col,
      rows: [...(col.rows ?? []), newRowValues[col.id] || ""]
    }));
    const novoConteudoStr = JSON.stringify(novoConteudo);
    console.log(novoConteudoStr)
    setConteudoState(novoConteudoStr);
    onValueChange(novoConteudoStr);
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
    onValueChange(novoConteudoStr);
  };

  // Função para upload real usando axios
  async function uploadFileToApi(file: File): Promise<any[]> {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("key", "1234");
    try {
      const response = await axios.post(
        "https://devwebhook.keepins.app/webhook/processar/arquivo/questionario",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      // Espera que a resposta seja um array de colunas
      return response.data;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message ?? "Erro ao processar o arquivo na API.");
    }
  }

  // Handler para upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    // Valida extensão
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
        onValueChange(JSON.stringify(response));
        setIsUploading(false);
      }
    } catch (err: any) {
      setUploadError(err.message ?? "Erro ao processar o arquivo.");
    }
  };

  // Handler para mapear colunas e salvar
  const handleMapAndSave = () => {
    if (!uploadJson || !field.colunas) return;
    // Para cada coluna do field, encontra a coluna do upload selecionada
    const mapped = field.colunas.map((col: any) => {
      const apiColName = columnMap[col.id];
      const apiCol = uploadJson.find((c: any) => c.nmColumn === apiColName);
      if (apiCol) {
        return {
          ...apiCol,
          id: col.id,
          nmColumn: col.nome, // nome do sistema
          namedTo: apiCol.nmColumn // nome da coluna da API
        };
      }
      // Se não mapeou, retorna vazio
      return null;
    }).filter(Boolean);
    // Garante que mapped é um array de objetos e salva como JSON válido
    const mappedJson = JSON.stringify(mapped, null, 2);
    console.log(mappedJson)
    setConteudoState(mappedJson);
    onValueChange(mappedJson);
    setShowMapModal(false);
    setIsUploading(false);
    setUploadJson(null);
    setColumnMap({});
  };

  return (
    <div className="w-full">
      {expandido && (
        <TableGridContainerExpanded colunas={colunasPreview.map((col) => ({
          ...col,
          colunaField: colunasState.find((c) => c.id === col.id),
          onEditCell: (newValue: string, rowIndex: number) => handleEditCell(col.id, newValue, rowIndex)
        }))} onBack={() => setExpandido(false)} />
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <span className="text-sm text-muted-foreground truncate">
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
              <Button variant="outline" size="sm" onClick={() => {
                const parsed = JSON.parse(field.conteudo ?? "[]");
                console.log(JSON.stringify(parsed))
              }}>
                mostrar conteudo
              </Button>
              {podeAdicionarLinha && (
                <Button variant="outline" size="sm" onClick={handleNovaLinha}>
                  Nova linha
                </Button>
              )}
              {podeAdicionarLinha && (
                <Button variant="outline" size="sm">
                  Editar colunas
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsUploading(true)}>
                Upload
              </Button>
            </div>
          </DialogHeader>
          {/* Área de upload */}
          {isUploading ? (
            <div className="flex flex-col items-center justify-center min-h-[250px] w-full border-2 border-dashed border-muted rounded-lg bg-muted/40 p-8">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div
                className="flex flex-col items-center gap-2 cursor-pointer"
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
                <span className="text-lg font-medium text-muted-foreground">Arraste um arquivo ou selecione do seu dispositivo</span>
                <span className="text-xs text-muted-foreground">(Apenas .csv, .xlsx, .xls)</span>
              </div>
              {uploadError && <span className="text-red-500 mt-2">{uploadError}</span>}
              <Button variant="outline" className="mt-4" onClick={() => setIsUploading(false)}>
                Cancelar upload
              </Button>
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
            <Button onClick={() => setIsOpen(false)}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar nova linha */}
      <Dialog open={showAddRow} onOpenChange={setShowAddRow}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar nova linha</DialogTitle>
            <DialogDescription>Preencha os campos para adicionar uma nova linha à tabela.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {colunasState.map((col: ColunaType) => (
              <GenericField
                key={col.id}
                field={{ ...col, campoApi: col.campoApi }}
                restFields={restFields ?? []}
                onValueChange={(value: string) => handleFieldChange(col.id, value)}
              />
            ))}
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
            <div className="flex flex-col gap-4 py-2">
              {field.colunas.map((col: any, idx: number) => {
                // Opções disponíveis: todas as colunas da API menos as já selecionadas nos outros selects
                const alreadySelected = Object.entries(columnMap)
                  .filter(([key, val]) => key !== col.id)
                  .map(([_, val]) => val);
                const availableApiCols = uploadJson.filter((apiCol: any) => !alreadySelected.includes(apiCol.nmColumn));
                return (
                  <div key={col.id} className="flex items-center gap-2">
                    <span className="w-48 font-medium text-sm">{col.nome}</span>
                    <Select
                      value={columnMap[col.id] || ""}
                      onValueChange={val => setColumnMap(prev => ({ ...prev, [col.id]: val }))}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Selecione a coluna" />
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMapModal(false)}>Cancelar</Button>
              <Button onClick={handleMapAndSave} disabled={Object.keys(columnMap).length !== field.colunas.length}>
                Próximo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}