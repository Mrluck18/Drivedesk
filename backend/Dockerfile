# Uso Alpine in modo che il container non pesi troppo
FROM node:18-alpine
# Creo la cartella di lavoro app
WORKDIR /app
# Copio solo la lista delle librerie di package.json
COPY package.*json ./
# Installo le librerie dentro il container. Sfrutto il caching di Dockerfile:
# Se modifico il codice ma non aggiungo nuove librerie, salto l'installazione (npm install) e uso la memoria cache
RUN npm install
# Copio il resto del codice sorgente
COPY . .
# Espongo la porta 5000
EXPOSE 5000
# Avvio il server
CMD ["npm", "start"]