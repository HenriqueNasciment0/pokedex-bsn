import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  PokemonListResponse,
  Pokemon,
  FavoritePokemon,
} from '../models/pokemon.interface';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  private readonly itemsPerPage = 20;

  private favoritesSubject = new BehaviorSubject<FavoritePokemon[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFavoritesFromStorage();
  }

  /**
   * Busca lista paginada de Pokémons
   * @param offset - Posição inicial para paginação
   * @param limit - Quantidade de items por página
   */
  getPokemonList(
    offset: number = 0,
    limit: number = this.itemsPerPage
  ): Observable<PokemonListResponse> {
    const url = `${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`;
    return this.http.get<PokemonListResponse>(url);
  }

  /**
   * Busca detalhes de um Pokémon específico
   * @param nameOrId - Nome ou ID do Pokémon
   */
  getPokemonDetails(nameOrId: string | number): Observable<Pokemon> {
    const url = `${this.baseUrl}/pokemon/${nameOrId}`;
    return this.http.get<Pokemon>(url);
  }

  /**
   * Extrai ID do Pokémon a partir da URL da lista
   * @param url - URL retornada pela API na lista
   */
  extractPokemonId(url: string): number {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
  }

  /**
   * Busca múltiplos Pokémons com detalhes
   * @param pokemonList - Lista de Pokémons básicos
   */
  getPokemonDetails$(pokemonList: any[]): Observable<Pokemon[]> {
    const detailRequests = pokemonList.map((pokemon) => {
      const id = this.extractPokemonId(pokemon.url);
      return this.getPokemonDetails(id);
    });

    return new Observable((observer) => {
      import('rxjs').then(({ forkJoin }) => {
        forkJoin(detailRequests).subscribe({
          next: (results) => {
            observer.next(results);
            observer.complete();
          },
          error: (error) => observer.error(error),
        });
      });
    });
  }

  /**
   * Adiciona Pokémon aos favoritos
   */
  addToFavorites(pokemon: Pokemon): void {
    const currentFavorites = this.favoritesSubject.value;
    const isAlreadyFavorite = currentFavorites.some(
      (fav) => fav.id === pokemon.id
    );

    if (!isAlreadyFavorite) {
      const favoritePokemon: FavoritePokemon = {
        id: pokemon.id,
        name: pokemon.name,
        image:
          pokemon.sprites.other['official-artwork'].front_default ||
          pokemon.sprites.front_default,
        dateAdded: new Date(),
      };

      const updatedFavorites = [...currentFavorites, favoritePokemon];
      this.favoritesSubject.next(updatedFavorites);
      this.saveFavoritesToStorage(updatedFavorites);
    }
  }

  /**
   * Remove Pokémon dos favoritos
   */
  removeFromFavorites(pokemonId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    const updatedFavorites = currentFavorites.filter(
      (fav) => fav.id !== pokemonId
    );
    this.favoritesSubject.next(updatedFavorites);
    this.saveFavoritesToStorage(updatedFavorites);
  }

  /**
   * Verifica se Pokémon está nos favoritos
   */
  isFavorite(pokemonId: number): boolean {
    return this.favoritesSubject.value.some((fav) => fav.id === pokemonId);
  }

  /**
   * Salva favoritos no localStorage
   */
  private saveFavoritesToStorage(favorites: FavoritePokemon[]): void {
    try {
      localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }

  /**
   * Carrega favoritos do localStorage
   */
  public loadFavoritesFromStorage(): void {
    try {
      const stored = localStorage.getItem('pokemon-favorites');
      if (stored) {
        const favorites = JSON.parse(stored) as FavoritePokemon[];
        this.favoritesSubject.next(favorites);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  }
}
