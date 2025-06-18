import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import {
  PokemonListResponse,
  Pokemon,
  FavoritePokemon,
} from '../models/pokemon.interface';

interface TypeResponse {
  id: number;
  name: string;
  pokemon: Array<{
    pokemon: {
      name: string;
      url: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  private readonly itemsPerPage = 20;

  private favoritesSubject = new BehaviorSubject<FavoritePokemon[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  private typeCache = new Map<string, Pokemon[]>();
  private allPokemonCache: Pokemon[] = [];

  constructor(private http: HttpClient) {
    this.loadFavoritesFromStorage();
  }

  /**
   * Busca lista paginada de Pokémons (para carregamento inicial)
   */
  getPokemonList(
    offset: number = 0,
    limit: number = this.itemsPerPage
  ): Observable<PokemonListResponse> {
    const url = `${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`;
    return this.http.get<PokemonListResponse>(url);
  }

  /**
   * Busca Pokémons por tipo específico
   */
  getPokemonByType(typeName: string): Observable<Pokemon[]> {
    if (this.typeCache.has(typeName)) {
      return new Observable((observer) => {
        observer.next(this.typeCache.get(typeName)!);
        observer.complete();
      });
    }

    const url = `${this.baseUrl}/type/${typeName}`;

    return this.http.get<TypeResponse>(url).pipe(
      switchMap((typeResponse) => {
        const pokemonList = typeResponse.pokemon
          .filter((p) => {
            const id = this.extractPokemonId(p.pokemon.url);
            return id <= 1010;
          })
          .slice(0, 100);

        const detailRequests = pokemonList.map((p) => {
          const id = this.extractPokemonId(p.pokemon.url);
          return this.getPokemonDetails(id);
        });

        return forkJoin(detailRequests);
      }),
      map((pokemons) => {
        this.typeCache.set(typeName, pokemons);
        return pokemons;
      }),
      catchError((error) => {
        console.error(`Erro ao buscar Pokémons do tipo ${typeName}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Busca Pokémons por múltiplos tipos
   */
  getPokemonByMultipleTypes(types: string[]): Observable<Pokemon[]> {
    if (types.length === 0) {
      return of([]);
    }

    if (types.length === 1) {
      return this.getPokemonByType(types[0]);
    }

    const typeRequests = types.map((type) => this.getPokemonByType(type));

    return forkJoin(typeRequests).pipe(
      map((results: Pokemon[][]) => {
        let intersection = results[0];

        for (let i = 1; i < results.length; i++) {
          intersection = intersection.filter((pokemon) =>
            results[i].some((p) => p.id === pokemon.id)
          );
        }

        const uniquePokemons = intersection.filter(
          (pokemon, index, self) =>
            index === self.findIndex((p) => p.id === pokemon.id)
        );

        return uniquePokemons.sort((a, b) => a.id - b.id);
      }),
      catchError((error) => {
        console.error('Erro ao buscar Pokémons por múltiplos tipos:', error);
        return of([]);
      })
    );
  }

  /**
   * Busca detalhes de um Pokémon específico
   */
  getPokemonDetails(nameOrId: string | number): Observable<Pokemon> {
    const url = `${this.baseUrl}/pokemon/${nameOrId}`;
    return this.http.get<Pokemon>(url);
  }

  /**
   * Extrai ID do Pokémon a partir da URL
   */
  extractPokemonId(url: string): number {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
  }

  /**
   * Busca todos os tipos disponíveis
   */
  getAllTypes(): Observable<string[]> {
    const url = `${this.baseUrl}/type`;
    return this.http
      .get<any>(url)
      .pipe(map((response) => response.results.map((type: any) => type.name)));
  }

  /**
   * Limpa cache
   */
  clearCache(): void {
    this.typeCache.clear();
    this.allPokemonCache = [];
  }

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

  removeFromFavorites(pokemonId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    const updatedFavorites = currentFavorites.filter(
      (fav) => fav.id !== pokemonId
    );
    this.favoritesSubject.next(updatedFavorites);
    this.saveFavoritesToStorage(updatedFavorites);
  }

  isFavorite(pokemonId: number): boolean {
    return this.favoritesSubject.value.some((fav) => fav.id === pokemonId);
  }

  private saveFavoritesToStorage(favorites: FavoritePokemon[]): void {
    try {
      localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }

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
