# Minha Pegada Ecológica

Criar um aplicativo educacional sobre Pegada Ecológica voltado para alunos do 8º ano (Ensino Fundamental, 13-14 anos), projetado para uma disciplina de Inteligência Artificial com foco em diagnóstico pré/pós-intervenção e feedback pedagógico personalizado via IA.

Requisitos centrais do produto:

1. Autenticação e Privacidade (LGPD / Menores de idade):
- Login simplificado sem e-mail: Pseudônimo do aluno (ex: A001, A009) e PIN/senha curta (ex: 4 a 6 dígitos).
- Pré-carregar ou permitir cadastrar a Turma 81 com os pseudônimos dos alunos.
- Acesso do Professor com senha administrativa para visualizar o painel geral da turma, acompanhar quem respondeu o Pré e o Pós, e exportar os dados em CSV/Excel.

2. Fluxo do Aluno:
- Etapa 1 (Percepção Ambiental): perguntas abertas reflexivas baseadas no questionário diagnóstico já aplicado:
  1. Escreva alguma coisa que está acontecendo com o meio ambiente e que você acha importante ou preocupante.
  2. Explique, com suas palavras, o que acontece nessa situação.
  3. Na sua opinião, quem ou o que faz isso acontecer?
  4. O que faria isso diminuir?
  5. Tem alguma coisa no seu dia a dia que tem relação com isso? Se sim, o quê?
- Etapa 2 (Calculadora de Carbono e Pegada Ecológica), liberada depois da percepção:
  a) Questionário de 21 perguntas adaptado da ISO 14067, com linguagem acessível (contexto, alimentação, transporte, aviação, energia, consumo e resíduos).
  b) Cálculo determinístico:
     - Pegada de carbono em kg CO₂e por ano, por etapa (`src/lib/carbon.ts`).
     - Pegada ecológica em hectares globais e em "quantos Planetas Terra seriam necessários se todos vivessem como você", por tipo de área, pelo método híbrido da Global Footprint Network (`src/lib/footprint.ts`).
  c) Resultado com placar, pegada ecológica, comparações com a média da turma, com celebridades e com o Brasil (SEEG), e o botão "Mostrar as contas".
  d) Feedback Pedagógico Personalizado por IA:
     - Prompt pedagógico estruturado para tom encorajador, empático e socrático para adolescentes de 13-14 anos.
     - A IA analisa a conexão entre a preocupação aberta do aluno (ex: desmatamento, queimadas) e os hábitos revelados na calculadora (ex: consumo de carne, energia), explicando a relação sistêmica de forma simples e propondo 2 a 3 missões práticas realistas para o cotidiano.
- A fase "Depois da Aula" (pós-intervenção) está oculta por enquanto (`SHOW_POST_PHASE` em `src/routes/aluno.tsx`) e será redesenhada sobre a calculadora.

3. Painel do Professor:
  - Lista de alunos por pseudônimo com status (Pré respondido, Pós respondido).
  - Métricas agregadas da turma (média de Planetas Terra consumidos pela Turma 81, categoria de maior impacto).
  - Visualização individual do feedback da IA e respostas.
  - Botão de exportação em CSV para relatórios da disciplina.

4. Design e Experiência do Usuário:
- Interface bonita, moderna, acolhedora e responsiva, com visual ecológico amigável (tons de verde, terra e azul), adequada e motivadora para estudantes do ensino fundamental.
- Mensagens claras, cards interativos e navegação intuitiva passo a passo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/283cf27a-29ba-44be-b262-b1dc4c1e62b3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
