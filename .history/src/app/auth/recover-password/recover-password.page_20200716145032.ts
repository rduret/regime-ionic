import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder,FormGroupDirective, NgForm, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import * as firebase from 'firebase';
import { ToastController } from '@ionic/angular';

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

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController) { }

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
      let message = "Un mail pour retrouver votre mot de passe vous a été envoyez à l'adresse indiquée, veuillez vérifier votre boite mail."
      this.presentToast(message);
    }).catch((error) => {
        this.info = this.authService.translateError(error);
        this.presentToast(this.info);
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      color: 'primary',
      cssClass: 'toast',
      duration: 2000,
    });
    toast.present();
  }
}
