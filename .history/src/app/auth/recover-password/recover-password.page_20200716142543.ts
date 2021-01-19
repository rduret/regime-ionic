import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder,FormGroupDirective, NgForm, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorStateMatcher } from '@angular/material/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
})
export class RecoverPasswordPage implements OnInit {

  error: any;
  info: string = "";
  recoverPasswordForm: FormGroup;
  emailFormControl: FormControl;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.emailFormControl = new FormControl('', [Validators.required, Validators.email])

    this.recoverPasswordForm = this.formBuilder.group({
      email: this.emailFormControl
    });
  }

  sendRecoverPasswordEmail(){
    let email = this.recoverPasswordForm.get('email').value;
    let auth = firebase.auth();
    firebase.auth().languageCode = 'fr';

    auth.sendPasswordResetEmail(email).then(() => {
      this.router.navigate(['/auth/mot-de-passe-perdu/confirmation'])
    }).catch((error) => {
      if(error.code == 'auth/user-not-found') //Si l'adresse mail n'existe pas
        this.router.navigate(['/auth/mot-de-passe-perdu/confirmation']);
      else
        this.info = this.authService.translateError(error);
    });
  }
}
