import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonPopover,
  IonContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  filterOutline,
  closeOutline,
  checkmarkOutline,
  chevronDownOutline,
} from 'ionicons/icons';

export interface PokemonType {
  name: string;
  color: string;
}

@Component({
  selector: 'app-pokemon-filter',
  templateUrl: './pokemon-filter.component.html',
  styleUrls: ['./pokemon-filter.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    IonChip,
    IonLabel,
    IonPopover,
    IonContent,
  ],
})
export class PokemonFilterComponent {
  @Input() selectedTypes: string[] = [];
  @Input() disabled: boolean = false;
  @Output() typesChanged = new EventEmitter<string[]>();
  @Input() compact: boolean = false;
  @Input() buttonClass = '';

  isPopoverOpen = false;
  searchTerm: string = '';

  pokemonTypes: PokemonType[] = [
    { name: 'normal', color: '#A8A878' },
    { name: 'fire', color: '#F08030' },
    { name: 'water', color: '#6890F0' },
    { name: 'electric', color: '#F8D030' },
    { name: 'grass', color: '#78C850' },
    { name: 'ice', color: '#98D8D8' },
    { name: 'fighting', color: '#C03028' },
    { name: 'poison', color: '#A040A0' },
    { name: 'ground', color: '#E0C068' },
    { name: 'flying', color: '#A890F0' },
    { name: 'psychic', color: '#F85888' },
    { name: 'bug', color: '#A8B820' },
    { name: 'rock', color: '#B8A038' },
    { name: 'ghost', color: '#705898' },
    { name: 'dragon', color: '#7038F8' },
    { name: 'dark', color: '#705848' },
    { name: 'steel', color: '#B8B8D0' },
    { name: 'fairy', color: '#EE99AC' },
  ];

  constructor() {
    addIcons({
      filterOutline,
      chevronDownOutline,
      closeOutline,
      checkmarkOutline,
    });
  }

  /**
   * Abre/fecha o popover (apenas se não estiver desabilitado)
   */
  togglePopover() {
    if (!this.disabled) {
      this.isPopoverOpen = !this.isPopoverOpen;
    }
  }

  /**
   * Fecha o popover
   */
  closePopover() {
    this.isPopoverOpen = false;
  }

  /**
   * Verifica se um tipo está selecionado
   */
  isTypeSelected(typeName: string): boolean {
    return this.selectedTypes.includes(typeName);
  }

  /**
   * Toggle seleção de tipo (apenas se não estiver desabilitado)
   */
  toggleType(typeName: string) {
    if (!this.disabled) {
      const currentTypes = [...this.selectedTypes];
      const index = currentTypes.indexOf(typeName);

      if (index > -1) {
        currentTypes.splice(index, 1);
      } else {
        currentTypes.push(typeName);
      }

      this.typesChanged.emit(currentTypes);
    }
  }

  /**
   * Limpa todos os filtros (apenas se não estiver desabilitado)
   */
  clearFilters() {
    if (!this.disabled) {
      this.typesChanged.emit([]);
      this.closePopover();
    }
  }

  /**
   * Capitaliza primeira letra
   */
  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Obtém a cor do tipo
   */
  getTypeColor(typeName: string): string {
    const type = this.pokemonTypes.find((t) => t.name === typeName);
    return type?.color || '#68A090';
  }

  /**
   * Filtra tipos baseado no termo de busca
   */
  getFilteredTypes(): PokemonType[] {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      return this.pokemonTypes;
    }

    const term = this.searchTerm.toLowerCase().trim();
    return this.pokemonTypes.filter((type) =>
      type.name.toLowerCase().includes(term)
    );
  }

  /**
   * TrackBy function para otimizar performance das listas
   */
  trackByType(index: number, type: string): string {
    return type;
  }

  /**
   * TrackBy function para lista de tipos no popover
   */
  trackByTypeName(index: number, type: PokemonType): string {
    return type.name;
  }

  /**
   * Método para verificar se há filtros aplicados
   */
  hasActiveFilters(): boolean {
    return this.selectedTypes.length > 0;
  }

  /**
   * Método para obter texto descritivo dos filtros
   */
  getFilterDescription(): string {
    if (this.selectedTypes.length === 0) {
      return 'Nenhum filtro aplicado';
    }

    if (this.selectedTypes.length === 1) {
      return `Filtrado por: ${this.capitalize(this.selectedTypes[0])}`;
    }

    if (this.selectedTypes.length <= 3) {
      return `Filtrado por: ${this.selectedTypes
        .map((type) => this.capitalize(type))
        .join(', ')}`;
    }

    return `${this.selectedTypes.length} tipos selecionados`;
  }

  /**
   * Método para verificar se todos os tipos estão selecionados
   */
  areAllTypesSelected(): boolean {
    return this.selectedTypes.length === this.pokemonTypes.length;
  }

  /**
   * Método para selecionar/desselecionar todos os tipos
   */
  toggleAllTypes() {
    if (this.disabled) return;

    if (this.areAllTypesSelected()) {
      this.typesChanged.emit([]);
    } else {
      this.typesChanged.emit(this.pokemonTypes.map((type) => type.name));
    }
  }
}
