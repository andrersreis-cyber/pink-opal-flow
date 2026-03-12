import streamlit as st
import time
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from camadas import nivel0, nivel1, nivel2, nivel3

NIVEIS = {
    0: nivel0,
    1: nivel1,
    2: nivel2,
    3: nivel3,
}

DESCRICOES = {
    0: "Sem camada de segurança",
    1: "Camada leve",
    2: "Camada média",
    3: "Camada alta",
}

DETALHES = {
    0: "Modelo bruto sem nenhuma intervenção. Responde qualquer prompt.",
    1: "System prompt básico instruindo o modelo a evitar conteúdo nocivo.",
    2: "System prompt reforçado + filtro léxico de palavras proibidas (input e output).",
    3: "System prompt + filtro léxico + validação semântica por segundo LLM.",
}

CORES = {
    0: "#e74c3c",
    1: "#e67e22",
    2: "#f1c40f",
    3: "#2ecc71",
}

LIMITE_TOKENS = 128000


def estimar_tokens(historico: list) -> int:
    total = sum(len(m["content"]) for m in historico)
    return total // 4  # ~4 chars por token


st.set_page_config(
    page_title="Estudo Científico: Camadas de Segurança em LLMs",
    page_icon="🧠",
    layout="wide"
)

st.markdown("""
<style>
    .titulo { font-size: 2rem; font-weight: bold; margin-bottom: 0; }
    .subtitulo { color: #888; font-size: 1rem; margin-bottom: 2rem; }
    .nivel-card {
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 8px;
        border-left: 4px solid;
    }
    .badge-bloqueado {
        background-color: #e74c3c;
        color: white;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: bold;
    }
    .badge-permitido {
        background-color: #2ecc71;
        color: white;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: bold;
    }
    .metrica { font-size: 0.85rem; color: #aaa; margin-top: 4px; }
    .chat-user {
        background: #1e3a5f;
        border-radius: 8px;
        padding: 8px 12px;
        margin: 4px 0;
        font-size: 0.9rem;
    }
    .chat-assistant {
        background: #1a2a1a;
        border-radius: 8px;
        padding: 8px 12px;
        margin: 4px 0;
        font-size: 0.9rem;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<p class="titulo">🧠 Estudo Científico: Camadas de Segurança em LLMs</p>', unsafe_allow_html=True)
st.markdown('<p class="subtitulo">Modelo base: Llama 3.1 8B (text) · Sem RLHF · Testado em 4 níveis de segurança</p>', unsafe_allow_html=True)

# Inicializa estado da sessão
if "memoria" not in st.session_state:
    st.session_state.memoria = {0: [], 1: [], 2: [], 3: []}

if "experimentos" not in st.session_state:
    st.session_state.experimentos = []

# Sidebar
with st.sidebar:
    st.header("Configuração")

    niveis_selecionados = st.multiselect(
        "Níveis a testar",
        options=[0, 1, 2, 3],
        default=[0, 1, 2, 3],
        format_func=lambda x: f"Nível {x} — {DESCRICOES[x]}"
    )

    temperatura = st.slider("Temperatura", min_value=0.0, max_value=1.0, value=0.7, step=0.1)

    st.divider()
    st.subheader("Uso de contexto")
    for n in [0, 1, 2, 3]:
        tokens = estimar_tokens(st.session_state.memoria[n])
        pct = min(tokens / LIMITE_TOKENS, 1.0)
        cor = CORES[n]
        st.markdown(f"<small style='color:{cor}'>Nível {n} — {tokens:,} / {LIMITE_TOKENS:,} tokens ({pct*100:.1f}%)</small>", unsafe_allow_html=True)
        st.progress(pct)

    st.divider()
    st.subheader("Níveis")
    for n in [0, 1, 2, 3]:
        cor = CORES[n]
        st.markdown(f"""
        <div class="nivel-card" style="border-color:{cor}; background-color:{cor}18;">
            <strong style="color:{cor}">Nível {n} — {DESCRICOES[n]}</strong><br>
            <small>{DETALHES[n]}</small>
        </div>
        """, unsafe_allow_html=True)

    st.divider()
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Limpar memória", use_container_width=True):
            st.session_state.memoria = {0: [], 1: [], 2: [], 3: []}
            st.rerun()
    with col2:
        if st.button("Limpar tudo", use_container_width=True):
            st.session_state.memoria = {0: [], 1: [], 2: [], 3: []}
            st.session_state.experimentos = []
            st.rerun()

# Área de chat por nível
if niveis_selecionados:
    cols = st.columns(len(niveis_selecionados))

    for i, nivel in enumerate(sorted(niveis_selecionados)):
        with cols[i]:
            cor = CORES[nivel]
            st.markdown(f"<strong style='color:{cor}'>Nível {nivel} — {DESCRICOES[nivel]}</strong>", unsafe_allow_html=True)

            # Exibe histórico de conversa do nível
            historico = st.session_state.memoria[nivel]
            chat_container = st.container(height=350)
            with chat_container:
                for msg in historico:
                    if msg["role"] == "user":
                        st.markdown(f'<div class="chat-user">👤 {msg["content"]}</div>', unsafe_allow_html=True)
                    elif msg["role"] == "assistant":
                        conteudo = msg["content"]
                        bloqueado = conteudo.startswith("[BLOQUEADO]")
                        icone = "🚫" if bloqueado else "🤖"
                        st.markdown(f'<div class="chat-assistant">{icone} {conteudo}</div>', unsafe_allow_html=True)

            tokens = estimar_tokens(historico)
            st.markdown(f'<p class="metrica">Contexto: {tokens:,} tokens · {len(historico)//2} turnos</p>', unsafe_allow_html=True)

# Input de prompt
prompt = st.chat_input("Digite o prompt para testar nos níveis selecionados...")

if prompt:
    if not niveis_selecionados:
        st.warning("Selecione ao menos um nível no painel lateral.")
    else:
        experimento = {"prompt": prompt, "resultados": {}}

        for nivel in sorted(niveis_selecionados):
            historico_atual = st.session_state.memoria[nivel]
            inicio = time.time()
            try:
                resposta, historico_novo = NIVEIS[nivel].executar(prompt, historico_atual)
                duracao = time.time() - inicio
                bloqueado = resposta.startswith("[BLOQUEADO]")
                st.session_state.memoria[nivel] = historico_novo
            except Exception as e:
                resposta = f"[ERRO] {str(e)}"
                duracao = time.time() - inicio
                bloqueado = False

            experimento["resultados"][nivel] = {
                "resposta": resposta,
                "latencia": round(duracao, 2),
                "bloqueado": bloqueado,
                "tokens": estimar_tokens(st.session_state.memoria[nivel])
            }

        st.session_state.experimentos.append(experimento)
        st.rerun()

# Histórico de experimentos
if st.session_state.experimentos:
    st.divider()
    st.subheader("Histórico de Experimentos")

    for idx, exp in enumerate(reversed(st.session_state.experimentos)):
        num = len(st.session_state.experimentos) - idx
        with st.expander(f"Experimento {num}: {exp['prompt'][:80]}"):
            st.markdown(f"**Prompt:** {exp['prompt']}")
            st.divider()
            for nivel, dados in exp["resultados"].items():
                cor = CORES[nivel]
                status = "BLOQUEADO" if dados["bloqueado"] else "PERMITIDO"
                st.markdown(
                    f"**<span style='color:{cor}'>Nível {nivel} — {DESCRICOES[nivel]}</span>** · "
                    f"{status} · {dados['latencia']}s · {dados['tokens']:,} tokens",
                    unsafe_allow_html=True
                )
                st.code(dados["resposta"])
