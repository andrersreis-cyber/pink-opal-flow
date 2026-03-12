import streamlit as st
import time
import json
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
</style>
""", unsafe_allow_html=True)

st.markdown('<p class="titulo">🧠 Estudo Científico: Camadas de Segurança em LLMs</p>', unsafe_allow_html=True)
st.markdown('<p class="subtitulo">Modelo base: Llama 3.1 8B (text) · Sem RLHF · Testado em 4 níveis de segurança</p>', unsafe_allow_html=True)

# Inicializa histórico na sessão
if "historico" not in st.session_state:
    st.session_state.historico = []

# Painel de controle
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
    if st.button("Limpar histórico", use_container_width=True):
        st.session_state.historico = []
        st.rerun()

# Área principal
prompt = st.chat_input("Digite o prompt para testar nos níveis selecionados...")

if prompt:
    if not niveis_selecionados:
        st.warning("Selecione ao menos um nível no painel lateral.")
    else:
        st.session_state.historico.append({
            "prompt": prompt,
            "resultados": {}
        })

        cols = st.columns(len(niveis_selecionados))

        for i, nivel in enumerate(sorted(niveis_selecionados)):
            with cols[i]:
                cor = CORES[nivel]
                st.markdown(f"<strong style='color:{cor}'>Nível {nivel} — {DESCRICOES[nivel]}</strong>", unsafe_allow_html=True)

                with st.spinner("Processando..."):
                    inicio = time.time()
                    try:
                        resposta = NIVEIS[nivel].executar(prompt)
                        duracao = time.time() - inicio
                        bloqueado = resposta.startswith("[BLOQUEADO]")
                    except Exception as e:
                        resposta = f"[ERRO] {str(e)}"
                        duracao = time.time() - inicio
                        bloqueado = False

                badge = '<span class="badge-bloqueado">BLOQUEADO</span>' if bloqueado else '<span class="badge-permitido">PERMITIDO</span>'
                st.markdown(badge, unsafe_allow_html=True)
                st.markdown(f'<p class="metrica">Latência: {duracao:.2f}s</p>', unsafe_allow_html=True)
                st.text_area("Resposta", value=resposta, height=200, key=f"resp_{nivel}_{len(st.session_state.historico)}", disabled=True)

                st.session_state.historico[-1]["resultados"][nivel] = {
                    "resposta": resposta,
                    "latencia": round(duracao, 2),
                    "bloqueado": bloqueado
                }

# Histórico de experimentos
if st.session_state.historico:
    st.divider()
    st.subheader("Histórico da Sessão")

    for idx, experimento in enumerate(reversed(st.session_state.historico)):
        with st.expander(f"Experimento {len(st.session_state.historico) - idx}: {experimento['prompt'][:80]}..."):
            st.markdown(f"**Prompt:** {experimento['prompt']}")
            st.divider()
            for nivel, dados in experimento["resultados"].items():
                cor = CORES[nivel]
                status = "BLOQUEADO" if dados["bloqueado"] else "PERMITIDO"
                st.markdown(f"**Nível {nivel} — {DESCRICOES[nivel]}** · {status} · {dados['latencia']}s")
                st.code(dados["resposta"])
