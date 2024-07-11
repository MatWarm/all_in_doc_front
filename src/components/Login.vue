import axios from "axios";
<script>
import axios from "axios";

export default {
  name: 'LoginForm', // Renommer le composant en "LoginForm"
  data() {
    return {
      user: null,
      url: "http://10.25.29.18:8000",
      form: {
        username: 'login',
        password: 'password',

      },
      errorMessage: ''
    }
  },
  methods: {
    async veriflogin() {
      this.resetError()
      console.log("veriflogin");
      var body = {
        login: this.form.username,
        password: this.form.password
      }
      await axios.post(this.url+"/conversation/login",body)
          .then(response => {
            //console.log(response)
            this.user = response.data;
          })
          .catch(error => {
            console.log(error.data)
            this.errorMessage = error.response.data.detail;
          });
      this.$emit('login-status', this.user);
    },
    resetError(){
      this.errorMessage = null;
    }
  },
  mounted() {
    //this.generateConnexion();
  }
}


</script>

<template>
  <div class="login-container">
    <div v-if="errorMessage" class="error-message">
      <span>{{ errorMessage }}</span>
      <button @click="resetError" class="btn">x</button>
    </div>
    <h2>Connexion</h2>
    <div class="form-group">
      <label for="username">Nom d'utilisateur:</label>
      <input type="text" id="username" name="username" v-model="form.username" required>
    </div>
    <div class="form-group">
      <label for="password">Mot de passe:</label>
      <input type="password" id="password" name="password" v-model="form.password" required>
    </div>
    <button @click="veriflogin()" >Connexion</button>
  </div>
</template>

<style scoped>
body {
  background-color: #f4f4f4;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-container {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  position:absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

  width: 300px;
}

.login-form h2 {
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: rgba(229, 9, 9, 0.97);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: rgba(231, 34, 34, 0.97);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);


}

.error-message {
  display: flex;  /* Utilise Flexbox pour la disposition */
  justify-content: space-between; /* Place les éléments aux extrémités opposées */
  align-items: center; /* Centre les éléments verticalement */
  color: red;
  padding: 10px;
  background-color: #f8d7da;
  border-color: #f5c6cb;
  margin: 10px;
  border-radius: 5px;
}

.error-message button {
  border: none;  /* Enlève la bordure du bouton */
  background: none;  /* Enlève le fond du bouton */
  color: red;  /* Assure que la couleur du texte du bouton est rouge */
  cursor: pointer;  /* Change le curseur en pointeur */
  font-weight: bold;  /* Rend le texte du bouton gras */
}

.btn {
  padding: 6px 10px;
  background-color: #fff;
  border: .2px solid #d1d5db;
  border-radius: .375rem;
  color: #4b5563;
  font-size: .875rem;
  font-weight: 600;
  line-height: normal;
  text-align: center;
  cursor: pointer;
}

.btn--small {
  padding: 4px 8px;
  font-size: .75rem;
}

.btn--large {
  padding: 8px 12px;
  font-size: 1rem;
}

.btn:hover {
  background-color: #f9fafb;
}

.btn:active {
  background-color: #f3f4f6;
}

.btn[disabled],
.btn:hover[disabled] {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}
</style>
