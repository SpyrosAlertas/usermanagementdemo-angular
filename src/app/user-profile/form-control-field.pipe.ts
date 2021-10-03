import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formControlField'
})
export class FormControlFieldPipe implements PipeTransform {

  // Splits camel case strings into words seperated with space
  // Every word starts with capital letter -> Input: exampleInputText
  // Output: Example Input Text
  transform(value: string): string {
    let result: string;
    result = value[0].toUpperCase();
    value = value.substring(1);

    const split = value.split(/(?=[A-Z])/);
    for (let i = 0; i < split.length; i++) {
      result += split[i];
      if (i + 1 < split.length && split[i].length > 1) {
        result += ' ';
      }
    }
    return result;
  }

}
