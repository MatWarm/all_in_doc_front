
<script>
import axios from "axios";

export default {
  name: 'ConversationForm',
  props:{
    user:{
      type:Object,
      required:true
    }
  },
  data() {
    return {
      url: "http://10.25.29.18:8000",
      messages: [],
      discussions: [],
      activeConversation: null,
      prompt: '',
      id:100000,
      loading: false,
      errorMessage: '',  // Stocke les messages d'erreur pour l'interface utilisateur
    };
  },
  methods: {
    disconnect(){
      console.log("déconnxion")
      this.$emit("disconnection", "false")
    },
    deleteConversation(discussionId){
      this.resetError()
      axios.delete(this.url+`/conversation/discussion/${discussionId}`)
          .then(response => {
            if (response.status === 204) {
              console.log('La conversation a été supprimée avec succès.');
              this.discussions = this.discussions.filter(discussion => discussion.id !== discussionId);
              if (this.activeConversation === discussionId) {
                this.activeConversation = null;
                this.getDiscussionOfUser()
              }
            }
          })
          .catch(error => {
            this.errorMessage = 'Erreur lors de la suppression de la conversation.';
            console.error('There was an error!', error);
          });
    },
    async getDiscussionOfUser() {
      this.resetError()
      await axios.get(this.url+`/conversation/discussions/${this.user.id}`)
        .then(response => {
          this.discussions = response.data;
        })
        .catch(error => {
          this.errorMessage = 'Erreur lors de la récupération des discussions.';
          console.error('There was an error!', error);
        });
    },
    getQuestionReponsesByDiscussion(discussionId) {
      this.resetError()
      this.messages = [];
      let url;
      url = this.url+"/conversation/discussions/questionReponse/" + discussionId
      axios.get(url)
          .then(response => {
            let result = response.data;
            result.forEach((element)=> {
              this.addMessageToConversation(element.question.contenu, true, element.question.id);
              this.addMessageToConversation(element.reponse.contenu, false,element.reponse.id);
            })
          })
          .catch(error => {
            console.error('There was an error!', error);
            this.errorMessage = 'Erreur lors de la récupération des discussions.';
          });
    },
    async addNewDiscussion() {
      this.resetError()
      let url = this.url+"/conversation/discussion"
      let body = {
        "id_user":this.user.id,
        "titre":"Nouvelle discussion"
      }
      return axios.post(url,body)
          .then(response => {
            console.log(response.data)
            return response.data
          })
          .catch(error => {
            console.error('There was an error!', error);
            this.errorMessage = "Erreur lors de l'ajout d'une nouvelle Conversation";
          });
    },
    async updateTitle(message){
      this.resetError()
      let discussionId = this.activeConversation

      let url = this.url+"/conversation/discussion/"+discussionId
      let body = {
        "message":message
      }
      return axios.patch(url,body)
          .then(response => {
            return response.data
          })
          .catch(error => {
            this.errorMessage = "Erreur lors de la modification du titre de la discussion.";
            console.error(this.errorMessage , error);
          });
    },
    async addMessage() {
      this.resetError()
      try {
        this.$refs.btnEnvoyer.disabled = true;
        const message = this.prompt;
        if (message !== '') {
          if (this.activeConversation === null) {
            let result = await this.addNewDiscussion();
            console.log(result)
            this.discussions.push(result);
            this.activeConversation = result.id;
            console.log(result.id)
            let resultUpdateTitle = await this.updateTitle(message)
            console.log(resultUpdateTitle)
            this.discussions.find(discussion => discussion.id === this.activeConversation).titre = resultUpdateTitle.titre;
          }

          let discussion_id = this.activeConversation;
          // Logique pour envoyer le message
          let result = await this.saveMessage(message)
          let id = result["id"]

          this.addMessageToConversation(message, id);

          let resultIA = await this.processMessage(message, id, discussion_id);
          let idIa = resultIA["id"]
          let reponseIa = await this.getReponseByID(idIa)
          console.log(reponseIa)


          this.addMessageToConversation(reponseIa["contenu"], false, reponseIa["id"]);
        }
        this.$refs.btnEnvoyer.disabled = false;
      }catch(error) {
        this.errorMessage = "Erreur lors de l'ajout du message.";
        console.error("Erreur lors de l'ajout du message. ", error);
      }
    },
    async getReponseByID(id) {
      this.resetError()
      try{
        let url = this.url+"/conversation/reponse/"+id
        return axios.get(url)
            .then(response => {
              return response.data
            })
            .catch(error => {
              console.error('There was an error!', error);
            });
      }catch(error){
        this.errorMessage = "Erreur lors de la récupération de la réponse.";
        console.error("Erreur lors de la récupération de la réponse. ", error);
      }

    },
    addMessageToConversation(message, isUser = true, id = this.id++) {
      this.resetError()
      try{
        if (message !== '') {
          // Ajoute le message à la liste des messages
          this.messages.push({ text: message, isUser:isUser, id: id});

          //console.log(this.messages)
          // Efface l'entrée de texte après l'envoi du message
          this.prompt = '';
          this.scrollToBottom();
        }
      }catch (error){
        this.errorMessage = "Erreur lors de l'ajout du message à la conversation.";
        //console.error("Erreur lors de l'ajout du message. ", error);
      }
    },
    async scrollToBottom() {
      await this.sleep(500);
      // Fait défiler la fenêtre de conversation vers le bas
      const listMessage = this.$refs.scrollbarLimit;
      //const lastMessage = listMessage.lastElementChild;
      console.log(listMessage)

      if (listMessage) {
        // Use el.scrollIntoView() to instantly scroll to the element
        console.log("scroll-down")
        listMessage.scrollIntoView({ behavior: 'smooth'});
      }
    },
    async saveMessage(message) {
      this.resetError()
      let url=this.url+"/conversation/question/"
      console.log(this.activeConversation)
      let body={"contenu":message, "discussion_id":this.activeConversation}
      return axios.post(url, body)
        .then(response => {
          console.log(response.data)
          return response.data
        })
        .catch(error => {
          this.errorMessage = "Erreur lors de l'ajout du message en mémoire";
          console.error('There was an error!', error);
        });
    },
    async processMessage(message,id,discussion_id) {
      this.resetError()
      let url=this.url+"/echangeIa/messages/"+discussion_id+"/"+id
      let body={"message":message}
      this.loading=true
      return axios.post(url, body)
        .then(response => {
          this.loading=false
          return response.data
        })
        .catch(error => {
          this.loading=false
          console.error('There was an error!', error);
          this.errorMessage = "Erreur lors de l'échange avec l'IA";
        });
    },
    newConversation(){
      this.resetError()
      this.messages = [];
      this.activeConversation = null;
    },
    resetError(){
      this.errorMessage = null;
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  },
  mounted() {
    this.getDiscussionOfUser();
    console.log(this.user)
  }
};
</script>

<template>
  <div id="application" class="container police" >
    <div id="menuVertical" class="menuVertical">
      <div class="conversations">
        <div id="conversation" class="titre_conversation">
          <img class="img_aid" src="all_in_doc.png">
        </div>
        <div class="gestionDiscussion">
          <label class="">Conversations</label>
          <button class="btn" @click="newConversation()">+</button>
        </div>

        <div class="liste_conversation">
          <ul id="liste_conversation">
            <li v-for="discussion in discussions"
                :key="discussion.id"
                :class="['conversation', discussion.id === activeConversation ? 'active' : '']"
                @click="activeConversation = discussion.id; getQuestionReponsesByDiscussion(discussion.id)">
              <div class="conversation-title">{{ discussion.titre }}</div>
              <button class="btn delete-btn-conversation" @click.stop="deleteConversation(discussion.id)">x</button>
            </li>
          </ul>
        </div>
      </div>
      <div id="profile" class="profile">
        <span>{{ user.prenom }}</span>
        <button class="btn" @click="disconnect">Deconnexion</button>
      </div>
    </div>


    <div id="fenetre_message" class = "fenetre_message" >
      <div v-if="errorMessage" class="error-message">
        <span>{{ errorMessage }}</span>
        <button @click="resetError" class="btn">x</button>
      </div>
      <div id="messages" ref="messages" class="messages" style="position: relative">
        <img v-if="messages.length === 0" src="AID_verticale.png" style="width: 300px; height:auto;position:absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); ">
          <div v-for="message in messages"
               :key="message.id"
               :class="['message', message.isUser ? 'message_utilisateur' : 'message_ia']">
            {{ message.text }}
        </div>
        <div ref="scrollbarLimit" id="test"> </div>
      </div>

      <div id="prompInput" class="prompt">
        <div class="loader" v-if="loading === true">
          <span class="l">L</span>
          <span class="o">o</span>
          <span class="a">a</span>
          <span class="d">d</span>
          <span class="i">i</span>
          <span class="n">n</span>
          <span class="g">g</span>
          <span class="d1">.</span>
          <span class="d2">.</span>
          <span class="d3">.</span>
        </div>
        <textarea id="input" class="police form__input" v-model="prompt" @keyup.enter="addMessage" placeholder="Votre message" rows="1"></textarea>
        <button @click="addMessage" ref="btnEnvoyer" id="envoyer" class="btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32" class="icon-2xl">
            <path fill="currentColor" fill-rule="evenodd" d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z" clip-rule="evenodd"></path>
        </svg>
    </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
label {
  font-size: 1.5em;
  font-weight: bold;
}

.img_aid {
  width:100%;
}

.form__input {
  padding: 4px 8px;
  min-height: 30px;
  border-radius: .375rem;
  border: .2px solid #d1d5db;
  background-color: #fff;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #1f2937;
}

.form__input--small {
  padding: 2px 4px;
  min-height: 24px;
  font-size: 12px;
  line-height: 16px;
}

.form__input--large {
  padding: 6px 12px;
  min-height: 38px;
  font-size: 16px;
  line-height: 24px;
}

.form__input:focus,
.form__input:focus-within,
.form__input:focus-visible {
  outline: none;
  border: 1px solid #6b7280;;
}

.form__input:disabled {
  background-color: #f3f4f6;
}

.form__input[readonly] {
  background-color: #f9fafb;
}

.form__input:invalid {
  border: 1px solid #fca5a5;
  color: #991b1b;
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
  border-radius: 9999px;
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

.conversation-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gestionDiscussion {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #ccc;
}

.liste_conversation ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.liste_conversation {
  flex-grow: 1;  /* Permet à cet élément de grandir pour remplir l'espace */
  overflow-y: auto;  /* Rend la liste défilable si nécessaire */
  white-space: nowrap;  /* Empêche le texte de passer à la ligne suivante */
  overflow-x: hidden; /* Empêche le défilement horizontal */
}


.delete-btn-conversation {
  visibility: hidden;
  flex-shrink: 0; /* Empêche le bouton de se réduire ou s'étendre */
}

.liste_conversation li:hover .delete-btn-conversation {
  visibility: visible; /* Rend le bouton visible lors du survol de l'élément de liste */
}

.liste_conversation li:hover {
  background-color: #e9e9e9; /* Couleur de fond au survol */
}

.liste_conversation li.active {
  background-color: #ddd; /* Couleur de fond pour l'élément actif */
  color: #000; /* Couleur du texte pour l'élément actif */
}

.profile {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #ccc; /* Ajoute une bordure en haut si désiré pour la séparation */
  justify-content: space-between;
}

.conversation {
  flex: 1;  /* Prend tout l'espace disponible */
  display: grid;
  gap: 5px;
  grid-template-columns: auto 15%; /* Crée une grille avec une colonne flexible et une colonne fixe */
  overflow: hidden;
  padding: 10px;
  border-bottom: 1px solid #ccc; /* Séparation visuelle entre les éléments */
  align-items: center;
}

.conversations {
  flex: 1;  /* Prend tout l'espace disponible */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.titre_conversation {
  display: flex; /* Utilise Flexbox pour la disposition */
  justify-content: center; /* Centre horizontalement le contenu dans le conteneur */
  align-items: center; /* Centre verticalement le contenu dans le conteneur */
  font-size: 1.5em; /* Taille de la police */
  margin: 20px 0; /* Espacement au-dessus et en dessous pour une meilleure présentation */
  width: 100%; /* S'assure que le conteneur prend toute la largeur disponible */
  height: 60px; /* Définit une hauteur fixe pour assurer une hauteur suffisante pour le centrage vertical */
}

.titre_conversation, .profile {
  flex-shrink: 0;  /* Empêche ces éléments de réduire et assure leur visibilité */
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%; /* Assure que le html et le body prennent toute la hauteur de la fenêtre du navigateur */
  width: 100%; /* Assure que le html et le body prennent toute la largeur de la fenêtre du navigateur */
  overflow: hidden; /* Empêche toute barre de défilement inattendue */
  box-sizing: border-box; /* Inclut padding et border dans la dimension totale des éléments */
  font-family: 'Roboto', sans-serif;
  background-color: rgba(229, 9, 9, 0.97);
}

.police{
  font-family: 'Roboto', sans-serif;
}

.container {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}

.fenetre_message{
  height: 100vh;
  display: flex; /* Utilisation de Flexbox */
  flex-direction: column; /* Les enfants sont organisés en colonne */
  flex-grow: 1; /* Prend tout l'espace disponible */
  background-color: #fff; /* Couleur de fond */
  align-items: stretch; /* Étend les enfants en largeur */
  justify-content: flex-start; /* Alignement vertical au début */
  //padding: 20px; /* Ajout d'espacement intérieur */
}

.prompt {
  display: flex; /* Utilisation de Flexbox */
  flex-direction: row; /* Organise les enfants en ligne */
  align-items: center; /* Centre les éléments verticalement */
  gap: 8px; /* Espacement entre les éléments */
  justify-content: center;
  padding: 20px;
  border-top: 1px solid lightgray;
}

.prompt textarea {
  width: 40%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 26px;
  resize: none; /* Empêche le redimensionnement manuel */
  box-sizing: border-box;
  height: auto; /* Démarre avec une hauteur adaptée au contenu */
  min-height: 20px; /* Hauteur minimale pour afficher au moins une ligne */
  max-height: 100px; /* Hauteur maximale avant de devenir scrollable */
}



.menuVertical {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Distribue l'espace, poussant le dernier enfant au bas */
  width: 20%;
  min-width: 20%;
  height: 100vh;
  overflow-y: hidden; /* Empêche le défilement vertical */
  background-color: #f4f4f5;
  padding: 10px;
  box-sizing: border-box;
}

.messages {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Permet au message de prendre tout l'espace sauf celui du prompt */
  overflow-y: auto; /* Permet le défilement vertical si nécessaire */
  gap: 4px; /* Espacement entre les messages */
  padding: 20px 60px 25px 60px;
}

.message_ia, .message_utilisateur {
  max-width: 60%; /* Limite la largeur maximale des messages pour un meilleur formatage */
  margin-top: 4px; /* Espacement vertical pour séparer les messages */
  padding: 8px; /* Padding intérieur pour les bulles de message */
  border-radius: 10px; /* Arrondit les coins des bulles de message */
  color: white; /* Couleur du texte */
  font-size: 1rem; /* Taille du texte */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); /* Ombre légère pour un effet élévé */
  white-space: pre-wrap
}

.message_ia {
  background-color: #708090; /* Couleur de fond pour les messages de l'IA */
  align-self: flex-start; /* Alignement à gauche */
  border-top-left-radius: 0; /* Supprime l'arrondi en haut à gauche pour un style de bulle */
}

.message_utilisateur {
  background-color: #4682B4; /* Couleur de fond pour les messages de l'utilisateur */
  align-self: flex-end; /* Alignement à droite */
  border-top-right-radius: 0; /* Supprime l'arrondi en haut à droite pour un style de bulle */
}


.l {
  color: black;
  opacity: 0;
  animation: pass 2s ease-in-out infinite;
  animation-delay: 0.2s;
  letter-spacing: 0.5em;
  text-shadow: 2px 2px 3px #919191;
}

.o {
  color: black;
  opacity: 0;
  animation: pass 2s ease-in-out infinite;
  animation-delay: 0.4s;
  letter-spacing: 0.5em;
  text-shadow: 2px 2px 3px #919191;
}

.a {
  color: black;
  opacity: 0;
  animation: pass 2s ease-in-out infinite;
  animation-delay: 0.6s;
  letter-spacing: 0.5em;
  text-shadow: 2px 2px 3px #919191;
}

.d {
  color: black;
  opacity: 0;
  animation: pass 2s ease-in-out infinite;
  animation-delay: 0.8s;
  letter-spacing: 0.5em;
  text-shadow: 2px 2px 3px #919191;
}

.i {
  color: black;
  opacity: 0;
  animation: pass 2s ease-in-out infinite;
  animation-delay: 1s;
  letter-spacing: 0.5em;
  text-shadow: 2px 2px 3px #919191;
}

.n {
  color: black;
  opacity: 0;
  animation: pass 2s ease-in-out infinite;
  animation-delay: 1.2s;
  letter-spacing: 0.5em;
  text-shadow: 2px 2px 3px #919191;
}

.g {
  color: black;
  opacity: 0;
  animation: pass 2s ease-in-out infinite;
  animation-delay: 1.4s;
  letter-spacing: 0.5em;
  text-shadow: 2px 2px 3px #919191;
}

.d1 {
  color: black;
  opacity: 0;
  animation: pass1 2s ease-in-out infinite;
  animation-delay: 1.6s;
  letter-spacing: 0.5em;
  text-shadow: 2px 2px 3px #919191;
}

.d2 {
  color: black;
  opacity: 0;
  animation: pass1 2s ease-in-out infinite;
  animation-delay: 1.8s;
  letter-spacing: 0.5em;
  text-shadow: 2px 2px 3px #919191;
}

.d3 {
  color: black;
  opacity: 0;
  animation: pass1 2s ease-in-out infinite;
  animation-delay: 2s;
  letter-spacing: 0.5em;
  text-shadow: 2px 2px 3px #919191;
}

@keyframes pass {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes pass1 {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>