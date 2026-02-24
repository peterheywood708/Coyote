FROM python:3.13
RUN apt-get update -y \
    && apt-get install ffmpeg -y
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD [ "python", "./main.py" ]