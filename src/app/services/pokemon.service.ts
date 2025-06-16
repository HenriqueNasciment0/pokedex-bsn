import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PokemonListResponse, Pokemon } from '../models/pokemon.interface';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  private readonly itemsPerPage = 20;

  constructor(private http: HttpClient) {}

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
}
