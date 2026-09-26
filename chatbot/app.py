import os
import time
from pathlib import Path
import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI, APIConnectionError, APIStatusError, RateLimitError
from service import answer

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
st.set_page_config(page_title="PelisDark | Asistente de cine", page_icon=":movie_camera:", layout="centered")
compact = st.query_params.get("compact") == "true"
if compact:
    st.markdown("""<style>
    .stMainBlockContainer { padding: 1rem 1rem 5rem; }
    [data-testid="stSidebar"], [data-testid="stSidebarCollapsedControl"] { display: none; }
    </style>""", unsafe_allow_html=True)
else:
    st.title("PelisDark")
    st.subheader("Tu proxima historia empieza aqui")
st.caption("Asistente de peliculas y series. Las respuestas pueden contener errores; evita compartir datos personales.")

with st.container() if compact else st.sidebar:
    if not compact:
        st.header("Conversacion")
    if st.button("Nueva conversacion", use_container_width=True):
        st.session_state.messages = []
        st.rerun()
    if not compact:
        st.link_button("Volver a PelisDark", os.getenv("FRONTEND_URL", "http://localhost:5173"))
        st.caption("La clave de OpenAI se configura en el servidor, nunca en el navegador.")

key = os.getenv("OPENAI_API_KEY", "")
model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
if not key or key.startswith("coloca_"):
    st.info("El asistente aun no esta conectado. Configura OPENAI_API_KEY en el archivo .env de PelisDark y reinicia Streamlit.")
    st.stop()

if "messages" not in st.session_state:
    st.session_state.messages = []
for item in st.session_state.messages:
    with st.chat_message(item["role"]):
        st.markdown(item["content"])

if prompt := st.chat_input("¿Que te gustaria ver hoy?", max_chars=1500):
    now = time.monotonic()
    if now - st.session_state.get("last_request", -10) < 5:
        st.warning("Espera unos segundos antes de enviar otra pregunta.")
        st.stop()
    st.session_state.last_request = now
    pending = st.session_state.messages[-11:] + [{"role": "user", "content": prompt}]
    with st.chat_message("user"):
        st.markdown(prompt)
    with st.chat_message("assistant"):
        try:
            with st.spinner("Buscando una buena historia..."):
                with OpenAI(api_key=key, timeout=25.0, max_retries=1) as client:
                    reply = answer(client, model, pending)
            st.markdown(reply)
            st.session_state.messages = (pending + [{"role": "assistant", "content": reply}])[-24:]
        except RateLimitError:
            st.error("El servicio alcanzo su limite de uso. Revisa el presupuesto de la API o intenta mas tarde.")
        except APIConnectionError:
            st.error("No fue posible conectar con OpenAI. Comprueba la conexion e intenta nuevamente.")
        except APIStatusError:
            st.error("OpenAI no pudo atender la consulta. Revisa la clave y el modelo configurados.")
        except ValueError as error:
            st.error(str(error))
