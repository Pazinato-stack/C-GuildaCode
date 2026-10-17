export type Modalidade = {
  id: number;
  slug: string;
  nome: string;
  descricao: string | null;
  imagem_url: string | null;
  horario: string | null;
  local: string | null;
  criado_em: string;
};

export type Perfil = {
  id: string;
  nome: string;
  email: string;
  role: "admin" | "professor";
  precisa_trocar_senha: boolean;
  criado_em: string;
};

export type Professor = {
  id: number;
  perfil_id: string | null;
  nome: string;
  email: string | null;
  telefone: string | null;
  modalidade_id: number;
  ativo: boolean;
  criado_em: string;
  modalidades?: Pick<Modalidade, "nome" | "slug"> | null;
};

export type Aluno = {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  modalidade_id: number;
  professor_id: number | null;
  ativo: boolean;
  criado_em: string;
  modalidades?: Pick<Modalidade, "nome" | "slug"> | null;
  professores?: Pick<Professor, "nome"> | null;
};

export type Chamada = {
  id: number;
  aluno_id: number;
  modalidade_id: number;
  data: string;
  presente: boolean;
  observacao: string | null;
  criado_em: string;
  alunos?: Pick<Aluno, "nome"> | null;
  modalidades?: Pick<Modalidade, "nome" | "slug"> | null;
};
