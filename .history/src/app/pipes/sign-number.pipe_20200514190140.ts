import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'signNumber'
})
export class SignNumberPipe implements PipeTransform {

  transform(value: number): string {
    if(value != undefined)
    {
        if(value > 0)
            return '+' + value;
        else
            return value.toString();
    }
  }

}
