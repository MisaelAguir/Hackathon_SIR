import os
import time
import pyodbc
from typing import Iterable, List, Dict, Any, Optional, Tuple

# Carga .env si existe (opcional)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# ── Parámetros desde variables de entorno ──────────────────────────────────────
DRIVER    = os.getenv("MSSQL_DRIVER", "ODBC Driver 18 for SQL Server")
SERVER    = os.getenv("MSSQL_SERVER", ".")                  # . o .\SQLEXPRESS o host,puerto
DATABASE  = os.getenv("MSSQL_DATABASE", "Proyecto_Alertas")
TRUSTED   = os.getenv("MSSQL_TRUSTED_CONNECTION", "yes")    # yes/no
ENCRYPT   = os.getenv("MSSQL_ENCRYPT", "yes")
TRUST_CERT= os.getenv("MSSQL_TRUST_CERT", "yes")
USERNAME  = os.getenv("MSSQL_USERNAME", "")                 # solo si TRUSTED=no
PASSWORD  = os.getenv("MSSQL_PASSWORD", "")                 # solo si TRUSTED=no

def _build_conn_str() -> str:
    """
    Construye la cadena de conexión soportando:
    - Autenticación integrada de Windows (Trusted_Connection=yes)
    - Usuario/contraseña (UID/PWD) cuando TRUSTED=no
    """
    parts = [
        f"DRIVER={{{DRIVER}}}",
        f"SERVER={SERVER}",
        f"DATABASE={DATABASE}",
        f"Encrypt={ENCRYPT}",
        f"TrustServerCertificate={TRUST_CERT}",
    ]
    if str(TRUSTED).lower() in {"yes", "true", "1", "y"}:
        parts.append("Trusted_Connection=yes")
    else:
        parts.append(f"UID={USERNAME}")
        parts.append(f"PWD={PASSWORD}")
    return ";".join(parts)

CONN_STR = _build_conn_str()

# ── Core de conexión/reintentos ────────────────────────────────────────────────
def get_connection(retries: int = 3, delay: float = 2.0, timeout: int = 5) -> pyodbc.Connection:
    """
    Abre una conexión con reintentos. Autocommit=True para soportar
    INSERT ... OUTPUT (lo usas en /incidents).
    """
    last_err: Optional[Exception] = None
    for attempt in range(1, retries + 1):
        try:
            return pyodbc.connect(CONN_STR, timeout=timeout, autocommit=True)
        except pyodbc.OperationalError as e:
            print(f"[Intento {attempt}] Error conexión: {e}")
            last_err = e
            if attempt < retries:
                time.sleep(delay)
    raise last_err or RuntimeError("No se pudo conectar a SQL Server.")

# ── Helpers de consulta ───────────────────────────────────────────────────────
def _rows_to_dicts(cursor: pyodbc.Cursor, rows: Iterable[Tuple]) -> List[Dict[str, Any]]:
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, r)) for r in rows]

def query_one(sql: str, params: Iterable[Any] = ()) -> Optional[Dict[str, Any]]:
    """
    Ejecuta una consulta y devuelve la primera fila como dict o None.
    """
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, list(params))
        row = cur.fetchone()
        return _rows_to_dicts(cur, [row])[0] if row else None
    finally:
        conn.close()

def query_all(sql: str, params: Iterable[Any] = ()) -> List[Dict[str, Any]]:
    """
    Ejecuta una consulta y devuelve todas las filas como lista de dicts.
    """
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, list(params))
        return _rows_to_dicts(cur, cur.fetchall())
    finally:
        conn.close()

def execute(sql: str, params: Iterable[Any] = ()) -> int:
    """
    Ejecuta un comando DML (INSERT/UPDATE/DELETE). Devuelve rowcount.
    """
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, list(params))
        return cur.rowcount
    finally:
        conn.close()

def executemany(sql: str, seq_params: Iterable[Iterable[Any]]) -> int:
    """
    Ejecuta un mismo comando para muchos juegos de parámetros (bulk).
    """
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.fast_executemany = True
        cur.executemany(sql, [list(p) for p in seq_params])
        return cur.rowcount
    finally:
        conn.close()

def scalar(sql: str, params: Iterable[Any] = ()) -> Any:
    """
    Devuelve el primer valor de la primera fila (útil para SELECT COUNT(*), etc.)
    """
    row = query_one(sql, params)
    if not row:
        return None
    return next(iter(row.values()))

# ── Prueba rápida desde consola ───────────────────────────────────────────────
if __name__ == "__main__":
    print("Probando conexión a SQL Server…")
    try:
        v = scalar("SELECT @@VERSION AS v")
        print("Conectado. @@VERSION:", (v.splitlines()[0] if isinstance(v, str) else v))
        db = scalar("SELECT DB_NAME() AS db")
        print("Base de datos:", db)
    except Exception as e:
        print("Fallo conexión:", e)