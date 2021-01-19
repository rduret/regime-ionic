import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private router: Router, ) { }

  createNewUser(email: string, password: string, goal: number){
    return new Promise(
      (resolve, reject) => {
        firebase.auth().createUserWithEmailAndPassword(email, password).then(
          () => {
            firebase.database().ref('/users/' + this.getUserId()).set({
              goal: goal
            });
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

  signInUser(email: string, password: string){
    return new Promise(
      (resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(email, password).then(
          () => {
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }
  
  signOutUser(){
    firebase.auth().signOut();
  }

  getUserId(): string{
    //Si utilisateur connecté on récupère son ID 
    if (firebase.auth().currentUser !== null)
      var userID: string = firebase.auth().currentUser.uid;
    else
      this.router.navigate(['/auth', 'signin']);
    return userID;
  }

  translateError(error: any){
    switch(error.code)
    {
      case 'auth/user-not-found':
        return "L'adresse mail et/ou le mot de passe sont erronés.";

      case 'auth/wrong-password':
        return "L'adresse mail et/ou le mot de passe sont erronés.";

      case 'auth/invalid-email':
        return "L'adresse mail fournie n'est pas valide.";

      case 'auth/email-already-in-use':
        return "L'adresse mail est déjà utilisée, veuillez en choisir une autre.";

      case 'auth/too-many-requests':
        return "Trop de tentatives de connexion, veuillez réessayer plus tard.";
      default:
        return error.message;
    }
  }
}
