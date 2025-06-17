import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonImg,
  IonButton,
  IonIcon,
  IonSpinner,
  IonChip,
  IonLabel,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heart,
  heartOutline,
  search,
  trash,
  timeOutline,
} from 'ionicons/icons';

import { PokemonService } from '../services/pokemon.service';
import { FavoritePokemon } from '../models/pokemon.interface';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonImg,
    IonButton,
    IonIcon,
    IonSpinner,
    IonChip,
    IonLabel,
  ],
})
export class FavoritesPage implements OnInit, OnDestroy {
  favorites: FavoritePokemon[] = [];
  isLoading = false;
  private favoritesSubscription?: Subscription;

  constructor(
    private pokemonService: PokemonService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      heart,
      heartOutline,
      search,
      trash,
      timeOutline,
    });
  }

  ngOnInit() {
    this.loadFavorites();
  }

  ngOnDestroy() {
    if (this.favoritesSubscription) {
      this.favoritesSubscription.unsubscribe();
    }
  }

  /**
   * Carrega favoritos e se inscreve para mudanças
   */
  private loadFavorites() {
    this.isLoading = true;

    this.favoritesSubscription = this.pokemonService.favorites$.subscribe({
      next: (favorites) => {
        this.favorites = favorites.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar favoritos:', error);
        this.showErrorToast('Erro ao carregar favoritos');
        this.isLoading = false;
      },
    });
  }

  /**
   * Navega para detalhes do Pokémon
   */
  viewPokemonDetails(pokemonId: number) {
    this.router.navigate(['/details', pokemonId]);
  }

  /**
   * Navega para a aba principal (Home)
   */
  goToMainTab() {
    this.router.navigate(['/tabs/home']);
  }

  /**
   * Confirma remoção de um favorito específico
   */
  async confirmRemoveFavorite(pokemon: FavoritePokemon, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Remover Favorito',
      message: `Deseja remover ${this.capitalize(pokemon.name)} dos favoritos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Remover',
          cssClass: 'danger',
          handler: () => {
            this.removeFavorite(pokemon);
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Confirma remoção de todos os favoritos
   */
  async confirmRemoveAll() {
    const alert = await this.alertController.create({
      header: 'Limpar Favoritos',
      message: `Deseja remover todos os ${this.favorites.length} Pokémons dos favoritos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Limpar Todos',
          cssClass: 'danger',
          handler: () => {
            this.removeAllFavorites();
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Remove um favorito específico
   */
  private removeFavorite(pokemon: FavoritePokemon) {
    this.pokemonService.removeFromFavorites(pokemon.id);
    this.showToast(`${this.capitalize(pokemon.name)} removido dos favoritos`);
  }

  /**
   * Remove todos os favoritos
   */
  private removeAllFavorites() {
    // Remove cada favorito individualmente
    this.favorites.forEach((pokemon) => {
      this.pokemonService.removeFromFavorites(pokemon.id);
    });
    this.showToast('Todos os favoritos foram removidos');
  }

  /**
   * Formata data para exibição
   */
  formatDate(date: Date): string {
    const now = new Date();
    const favoriteDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - favoriteDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hoje';
    } else if (diffDays === 2) {
      return 'Ontem';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} dias atrás`;
    } else {
      return favoriteDate.toLocaleDateString('pt-BR');
    }
  }

  /**
   * Capitaliza primeira letra
   */
  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Otimiza performance da lista
   */
  trackByPokemonId(index: number, pokemon: FavoritePokemon): number {
    return pokemon.id;
  }

  /**
   * Mostra toast de sucesso
   */
  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success',
    });
    toast.present();
  }

  /**
   * Mostra toast de erro
   */
  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger',
    });
    toast.present();
  }
}
