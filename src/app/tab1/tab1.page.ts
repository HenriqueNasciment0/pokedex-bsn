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
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    IonChip,
    IonLabel,
  ],
})
export class Tab1Page implements OnInit {
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

    if (!this.hasMoreData) {
      event.target.disabled = true;
    }
  }

  /**
   * Navega para a página de detalhes
   */
  viewPokemonDetails(pokemon: Pokemon) {
    this.router.navigate(['/pokemon-detail', pokemon.id]);
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
   * Mostra toast de sucesso
   */
  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
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
      position: 'bottom',
      color: 'danger',
    });
    toast.present();
  }
}
