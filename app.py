from flask import Flask, request, jsonify
from flask_cors import CORS # Để cho phép Web gọi tới Python
import pyodbc

app = Flask(__name__)
CORS(app) # Rất quan trọng để JS gọi được Python
# Cấu hình kết nối SQL Server của bạn
conn_str = (
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=DESKTOP-8886P1C\\SQLEXPRESS;"
    "Database=QuanLyTaiLieu;"
    "Trusted_Connection=yes;"
    "Encrypt=no;"
)
@app.route('/upload', methods=['POST'])
def upload_data():
    data = request.json # Nhận dữ liệu từ JS gửi qua
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        sql = "INSERT INTO Documents (FileName, SchoolName, SubjectName, AcademicYear, Category) VALUES (?, ?, ?, ?, ?)"
        params = (data['fileName'], data['school'], data['subject'], data['year'], data['category'])
        
        cursor.execute(sql, params)
        conn.commit()
        conn.close()
        return jsonify({"message": "Lưu dữ liệu thành công!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000) # Python chạy ở cổng 5000