import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  IonCardContent,
  IonImg,
  IonButton,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  IonChip,
  IonLabel,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';

import { PokemonService } from '../services/pokemon.service';
import { Pokemon, PokemonListItem } from '../models/pokemon.interface';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
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
    IonCardContent,
    IonImg,
    IonButton,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    IonChip,
    IonLabel,
  ],
})
export class HomePage implements OnInit {
  pokemons: Pokemon[] = [];
  currentOffset = 0;
  isLoading = false;
  hasMoreData = true;
  private itemsPerPage = 20;

  constructor(
    private pokemonService: PokemonService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ heart, heartOutline });
  }

  ngOnInit() {
    this.loadInitialPokemons();
  }

  /**
   * Carrega os primeiros Pokémons com loading
   */
  async loadInitialPokemons() {
    const loading = await this.loadingController.create({
      message: 'Carregando Pokémons...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      await this.loadPokemons();
    } catch (error) {
      this.showErrorToast('Erro ao carregar Pokémons');
    } finally {
      loading.dismiss();
    }
  }

  /**
   * Carrega lista de Pokémons da API
   */
  async loadPokemons() {
    if (this.isLoading || !this.hasMoreData) return;

    this.isLoading = true;

    try {
      const response = await this.pokemonService
        .getPokemonList(this.currentOffset, this.itemsPerPage)
        .toPromise();

      if (!response) return;

      const pokemonDetails = await this.loadPokemonDetails(response.results);

      this.pokemons = [...this.pokemons, ...pokemonDetails];

      this.currentOffset += this.itemsPerPage;

      this.hasMoreData = response.next !== null;
    } catch (error) {
      console.error('Erro ao carregar Pokémons:', error);
      this.showErrorToast('Erro ao carregar Pokémons');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Carrega detalhes individuais dos Pokémons
   */
  private async loadPokemonDetails(
    pokemonList: PokemonListItem[]
  ): Promise<Pokemon[]> {
    const detailPromises = pokemonList.map((pokemon) => {
      const id = this.pokemonService.extractPokemonId(pokemon.url);
      return this.pokemonService.getPokemonDetails(id).toPromise();
    });

    const results = await Promise.all(detailPromises);
    return results.filter((pokemon) => pokemon !== undefined) as Pokemon[];
  }

  /**
   * Manipula o infinite scroll
   */
  async onInfiniteScroll(event: any) {
    await this.loadPokemons();
    event.target.complete();

    // Desabilita infinite scroll se não há mais dados
    if (!this.hasMoreData) {
      event.target.disabled = true;
    }
  }

  /**
   * Navega para a página de detalhes
   */
  viewPokemonDetails(pokemon: Pokemon) {
    this.router.navigate(['/details', pokemon.id]);
  }

  /**
   * Toggle favorito
   */
  async toggleFavorite(pokemon: Pokemon, event: Event) {
    event.stopPropagation();

    const isFavorite = this.pokemonService.isFavorite(pokemon.id);

    if (isFavorite) {
      this.pokemonService.removeFromFavorites(pokemon.id);
      this.showToast(`${this.capitalize(pokemon.name)} removido dos favoritos`);
    } else {
      this.pokemonService.addToFavorites(pokemon);
      this.showToast(
        `${this.capitalize(pokemon.name)} adicionado aos favoritos`
      );
    }
  }

  /**
   * Verifica se Pokémon é favorito
   */
  isFavorite(pokemonId: number): boolean {
    return this.pokemonService.isFavorite(pokemonId);
  }

  /**
   * Obtém a melhor imagem do Pokémon
   */
  getPokemonImage(pokemon: Pokemon): string {
    return (
      pokemon.sprites.other['official-artwork'].front_default ||
      pokemon.sprites.front_default ||
      'assets/pokemon-placeholder.png'
    );
  }

  /**
   * Obtém cor baseada no tipo principal do Pokémon
   */
  getTypeColor(pokemon: Pokemon): string {
    const typeColors: { [key: string]: string } = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };

    const primaryType = pokemon.types[0]?.type.name || 'normal';
    return typeColors[primaryType] || '#68A090';
  }

  /**
   * Capitaliza primeira letra
   */
  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
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
