import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
})
export class MyAccountPage implements OnInit {

  email: string;
  goal: string;

  constructor() { }

  ngOnInit() {
    let user = firebase.auth().currentUser;
    let goalRef = firebase.database().ref('/users/' + user.uid + '/goal');

    if (user != null) {
      this.email = user.email;

        goalRef.once("value", (snapshot) => {
            this.goal = snapshot.val()
        },  (errorObject) => {
              console.log("Erreur: " + errorObject.name);
            })
      }
  }

}
