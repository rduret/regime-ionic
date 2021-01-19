import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {

  changePasswordForm: FormGroup;
  oldPasswordFormControl: FormControl;
  newPasswordFormControl: FormControl;
  newPasswordConfirmationFormControl: FormControl;

  constructor(private formBuilder: FormBuilder, private router: Router) { }

  ngOnInit() {
     this.initForm();
  }

  initForm(){
    this.oldPasswordFormControl = new FormControl('', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)])
    this.newPasswordFormControl = new FormControl('', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)])
    this.newPasswordConfirmationFormControl = new FormControl('', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)])

    this.changePasswordForm = this.formBuilder.group({
      oldPasswordFormControl: this.oldPasswordFormControl,
      newPasswordFormControl: this.newPasswordFormControl,
      newPasswordConfirmationFormControl: this.newPasswordConfirmationFormControl
    });
  }

  changePassword(){
    let oldPassword = this.changePasswordForm.get('oldPasswordFormControl').value;
    let newPassword = this.changePasswordForm.get('newPasswordFormControl').value;
    let newPasswordConfirmation = this.changePasswordForm.get('newPasswordConfirmationFormControl').value;
    let user = firebase.auth().currentUser;
    let credential = firebase.auth.EmailAuthProvider.credential(
      user.email, 
      oldPassword
    );
    

    if(newPassword != newPasswordConfirmation)
    {
      this.info = "Les deux mots de passe ne sont pas identiques.";
    }

    else{
      //On vérifie que le mdp actuel est valable
      user.reauthenticateAndRetrieveDataWithCredential(credential).then(() => {
        user.updatePassword(newPassword).then(() => {   
          this.router.navigate(['auth/mon-compte/modifier-mot-de-passe-confirmation'])            //si oui on change le mdp
        }).catch((error) => {
          this.info = "Le mot de passe n'a pas pu être modifié.";
          error = true;
          });
      }).catch((error) => {
        this.info = "Le mot de passe actuel n'est pas correct.";
        error = true;
        });
    }
  }

}
