# Riaar API (FastAPI)

## Requisitos
- Python 3.10+

## Instalación
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt

# Opcional: copiar variables
cp .env.example .env

## Ejecutar
uvicorn app:app --reload --port 8000
