#include <stdio.h>
#define LIGNE 20

int main(){
    int nb, i;
    int tab[LIGNE];
    char buffer;

    printf("Veuillez saisir un nombre: ");
    scanf("%d", &nb);
    scanf("%c", &buffer);

    for(i=0;i<nb;i++){
            printf("Saisissez la valeur n°%d", i);
            scanf("%d", &tab[i]);
            scanf("%c", &buffer);
    }

    return 0;
}