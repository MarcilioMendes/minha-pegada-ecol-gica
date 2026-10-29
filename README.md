# Minha Pegada Ecológica

Criar um aplicativo educacional sobre Pegada Ecológica voltado para alunos do 8º ano (Ensino Fundamental, 13-14 anos), projetado para uma disciplina de Inteligência Artificial com foco em diagnóstico pré/pós-intervenção e feedback pedagógico personalizado via IA.

Requisitos centrais do produto:

1. Autenticação e Privacidade (LGPD / Menores de idade):
- Login simplificado sem e-mail: Pseudônimo do aluno (ex: A001, A009) e PIN/senha curta (ex: 4 a 6 dígitos).
- Pré-carregar ou permitir cadastrar a Turma 81 com os pseudônimos dos alunos.
- Acesso do Professor com senha administrativa para visualizar o painel geral da turma, acompanhar quem respondeu o Pré e o Pós, e exportar os dados em CSV/Excel.

2. Fluxo do Aluno:
- Fase 1 (Diagnóstico Inicial / Pré-Intervenção):
  a) Percepção Ambiental: Perguntas abertas reflexivas baseadas no questionário diagnóstico já aplicado:
     1. Escreva alguma coisa que está acontecendo com o meio ambiente e que você acha importante ou preocupante.
     2. Explique, com suas palavras, o que acontece nessa situação.
     3. Na sua opinião, quem ou o que faz isso acontecer?
     4. O que faria isso diminuir?
     5. Tem alguma coisa no seu dia a dia que tem relação com isso? Se sim, o quê?
  b) Questionário de Pegada Ecológica (10 perguntas adaptadas para o 8º ano com linguagem acessível, divididas em Alimentação, Transporte, Moradia/Energia e Consumo/Lixo):
     - Q1 (Alimentação): Com que frequência você come carne (bovina/frango) durante a semana?
     - Q2 (Alimentação): Como costuma ser o desperdício de comida no seu prato?
     - Q3 (Alimentação): Quanto da sua alimentação vem de alimentos ultraprocessados (salgadinhos, refrigerantes, biscoitos)?
     - Q4 (Transporte): Como você costuma ir para a escola ou passear no dia a dia? (A pé/bike, transporte público/van, carona/carro próprio)
     - Q5 (Energia/Água): Quanto tempo dura o seu banho diário em média?
     - Q6 (Energia/Água): Você ou sua família costumam deixar luzes acesas ou aparelhos na tomada sem ninguém usando?
     - Q7 (Energia/Água): Na sua casa usam ar-condicionado ou ventilador com frequência?
     - Q8 (Consumo): Com que frequência você compra ou ganha roupas/calçados novos sem necessidade urgente?
     - Q9 (Consumo): O que acontece quando um aparelho eletrônico ou brinquedo estraga? (Tenta consertar / compra outro novo)
     - Q10 (Resíduos): Na sua casa existe separação do lixo reciclável (papel, plástico, vidro)?
  c) Cálculo Determinístico e Visualização dos Resultados:
     - Cálculo de "Quantos Planetas Terra seriam necessários se todos vivessem como você" (ex: 1.8 Terras, 2.5 Terras).
     - Gráfico visual moderno e intuitivo (rosca ou barras) mostrando a distribuição da pegada por categoria (Alimentação, Transporte, Energia/Água, Consumo/Resíduos).
  d) Feedback Pedagógico Personalizado por IA:
     - Prompt pedagógico estruturado para tom encorajador, empático e socrático para adolescentes de 13-14 anos.
     - A IA deve analisar a conexão entre a preocupação aberta do aluno (ex: desmatamento, queimadas) e os hábitos revelados na pegada (ex: consumo de carne, energia), explicando a relação sistêmica de forma simples e propondo 2 a 3 missões práticas realistas para o cotidiano.
- Fase 2 (Pós-Intervenção):
  - Permite ao aluno revisitar a reflexão após a aula/intervenção pedagógica, reavaliar seus hábitos e ver um comparativo visual lado a lado ("Antes vs. Depois"), destacando o amadurecimento e a redução da pegada.

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
