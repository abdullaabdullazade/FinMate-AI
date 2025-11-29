FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8300

CMD ["python3", "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8200"]
