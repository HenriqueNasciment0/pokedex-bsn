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
  IonChip,
  IonLabel,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heart,
  heartOutline,
  searchOutline,
  chevronDownOutline,
} from 'ionicons/icons';

import { PokemonService } from '../services/pokemon.service';
import { Pokemon, PokemonListItem } from '../models/pokemon.interface';
import { PokemonFilterComponent } from '../components/pokemon-filter/pokemon-filter.component';
import { firstValueFrom } from 'rxjs';

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
    IonChip,
    IonLabel,
    PokemonFilterComponent,
  ],
})
export class HomePage implements OnInit {
  displayedPokemons: Pokemon[] = [];
  allPokemons: Pokemon[] = [];
  filteredPokemonsFromAPI: Pokemon[] = [];
  selectedTypes: string[] = [];

  currentOffset = 0;
  isLoading = false;
  isFilterLoading = false;
  hasMoreData = true;
  private itemsPerPage = 20;

  currentMode: 'normal' | 'filtered' = 'normal';

  constructor(
    private pokemonService: PokemonService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ heart, heartOutline, searchOutline, chevronDownOutline });
  }

  ngOnInit() {
    this.loadInitialPokemons();
  }

  /**
   * Getter para Pokémons que devem ser exibidos
   */
  get pokemonsToDisplay(): Pokemon[] {
    return this.currentMode === 'filtered'
      ? this.filteredPokemonsFromAPI
      : this.displayedPokemons;
  }

  /**
   * Manipula mudanças nos tipos selecionados
   */
  async onTypesChanged(types: string[]) {
    this.selectedTypes = types;

    if (types.length === 0) {
      this.currentMode = 'normal';
      this.displayedPokemons = [...this.allPokemons];
      this.hasMoreData = true;
    } else {
      this.currentMode = 'filtered';
      this.hasMoreData = false;

      await this.loadPokemonsByTypes(types);
    }
  }

  /**
   * Carrega Pokémons filtrados por tipos da API
   */
  private async loadPokemonsByTypes(types: string[]) {
    this.filteredPokemonsFromAPI = [];

    const loading = await this.loadingController.create({
      message: 'Buscando Pokémons por tipo...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      const result = await firstValueFrom(
        this.pokemonService.getPokemonByMultipleTypes(types)
      );

      if (result) {
        this.filteredPokemonsFromAPI = result;
      }
    } catch (error) {
      console.error('Erro ao filtrar por tipos:', error);
      this.showErrorToast('Erro ao buscar Pokémons por tipo');
    } finally {
      loading.dismiss();
    }
  }

  /**
   * Carrega os primeiros Pokémons com loading
   */
  async loadInitialPokemons() {
    const loading = await this.loadingController.create({
      message: 'Carregando Pokédex...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      await this.loadPokemons();
    } catch (error) {
      this.showErrorToast('Erro ao carregar Pokédex');
    } finally {
      loading.dismiss();
    }
  }

  /**
   * Carrega lista paginada de Pokémons da API (modo normal)
   */
  async loadPokemons() {
    if (
      this.isLoading ||
      !this.hasMoreData ||
      this.currentMode === 'filtered'
    ) {
      return;
    }

    this.isLoading = true;

    try {
      const response = await this.pokemonService
        .getPokemonList(this.currentOffset, this.itemsPerPage)
        .toPromise();

      if (!response) return;

      const pokemonDetails = await this.loadPokemonDetails(response.results);

      this.allPokemons = [...this.allPokemons, ...pokemonDetails];
      this.displayedPokemons = [...this.displayedPokemons, ...pokemonDetails];

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
    if (this.currentMode === 'normal') {
      await this.loadPokemons();
    }

    event.target.complete();

    if (!this.hasMoreData || this.currentMode === 'filtered') {
      event.target.disabled = true;
    } else {
      event.target.disabled = false;
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
   * Limpa cache e recarrega
   */
  async refreshData() {
    this.pokemonService.clearCache();
    this.allPokemons = [];
    this.displayedPokemons = [];
    this.filteredPokemonsFromAPI = [];
    this.currentOffset = 0;
    this.hasMoreData = true;
    this.selectedTypes = [];
    this.currentMode = 'normal';

    await this.loadInitialPokemons();
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success',
    });
    toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger',
    });
    toast.present();
  }

  /**
   * TrackBy function para melhor performance no *ngFor
   */
  trackByPokemonId(index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }

  isFilteredMode(): boolean {
    return this.currentMode === 'filtered';
  }
}
