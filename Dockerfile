# Usa una imagen base oficial de Node.js
FROM node:18

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto en el que tu app se ejecutará
EXPOSE 3000

# Define el comando para ejecutar tu app
CMD ["npm", "start"]
