# Optional: enable MySQL support via pymysql if installed.
# For the portfolio demo we default to SQLite, so this import is guarded.
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass
