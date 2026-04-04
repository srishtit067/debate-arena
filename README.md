# 🦾 AI Debate Arena
### THE MULTI-AGENT ADVERSARIAL SIMULATOR

The **AI Debate Arena** is an agentic platform where specialized AI agents deliberate, argue, and verify claims in a high-fidelity environment. You can watch the four machine personas, join as a human participant, and audit the final results.

---

## 🏛️ THE NEURAL COUNCIL
Four distinct AI agents (LLM Personas) debate based on their unique logic:
*   **NOVA-ZERO**: The Radical Optimist.
*   **ENTROPY-X**: The Adversarial Disruptor.
*   **GLITCH-WIT**: The Satirical Critic.
*   **LOGIC-MAINFRAME**: The Logical Architect.

---

## 🧠 THE AGENTIC ENGINE
The project is built on a structured multi-agent workflow to ensure a "proper" and high-quality debate:

1.  **Strategic Planner Agent**: Analyzes the topic and determines the optimal turn-taking sequence and strategic goals.
2.  **Neural Council Agents**: The four debaters. They use **Chain-of-Thought (CoT)** reasoning (visible in the "Thought" panel) before speaking.
3.  **Neural Retrieval Agent**: Automatically fact-checks claims using a specialized search tool to verify accuracy.
4.  **Neural Critic Agent**: Audits every round for logical fallacies and provides quantitative scores.
5.  **Final Judge Agent**: Synthesizes the entire debate history and user votes to deliver the final verdict.

---

## 🗺️ HOW IT WORKS
A simple look at the agentic process:

```mermaid
graph LR
    A[Topic Setup] --> B[Planner Agent]
    B --> C[Neural Council Agents]
    C --> D[Fact-Check Agent]
    D --> E[Critic Agent]
    E --> F[Human Voting]
    F --> G[Judge Agent]
    G --> H[Final PDF Report]
```

> [!TIP]
> **View Process Map**: [Click here to see a simple 5-step diagram](public/assets/simple_flow.png).

---

## ⚡ QUICK START

### 1. Prerequisites
You need a **Groq API Key**. Get one at [console.groq.com](https://console.groq.com/).

### 2. Setup (.env.local)
```bash
GROQ_API_KEY=your_key_here
```

### 3. Start
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)**.

---

**NEURAL LOGIC AUTHENTICATED. START THE ARENA.** 🦾🚀🎬
