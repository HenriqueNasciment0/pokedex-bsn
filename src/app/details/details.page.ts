import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonImg,
  IonButton,
  IonIcon,
  IonSpinner,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heart,
  heartOutline,
  arrowBack,
  statsChart,
  resize,
  barbell,
  flash,
  shield,
  speedometer,
  gameController,
  images,
  resizeOutline,
  barbellOutline,
  starOutline,
  analyticsOutline,
  flashOutline,
  diamondOutline,
  gitBranchOutline,
  imagesOutline,
  informationCircleOutline,
  trophyOutline,
  gameControllerOutline,
  sparkles,
  fitness,
  eye,
  trendingUp,
  pulse,
  rocket,
} from 'ionicons/icons';

import { PokemonService } from '../services/pokemon.service';
import { Pokemon } from '../models/pokemon.interface';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonImg,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
})
export class DetailsPage implements OnInit {
  pokemon: Pokemon | null = null;
  isLoading = true;
  pokemonId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pokemonService: PokemonService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({
      heart,
      heartOutline,
      arrowBack,
      statsChart,
      resize,
      barbell,
      flash,
      shield,
      speedometer,
      gameController,
      images,
      resizeOutline,
      barbellOutline,
      starOutline,
      analyticsOutline,
      flashOutline,
      diamondOutline,
      gitBranchOutline,
      imagesOutline,
      informationCircleOutline,
      trophyOutline,
      gameControllerOutline,
      sparkles,
      fitness,
      eye,
      trendingUp,
      pulse,
      rocket,
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pokemonId = parseInt(id, 10);
      this.loadPokemonDetails();
    } else {
      this.router.navigate(['/tabs/home']);
    }
  }

  /**
   * Carrega os detalhes completos do Pokémon
   */
  async loadPokemonDetails() {
    const loading = await this.loadingController.create({
      message: 'Carregando detalhes...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      this.pokemon = await firstValueFrom(
        this.pokemonService.getPokemonDetails(this.pokemonId)
      );
      console.log('Pokemon carregado:', this.pokemon);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      this.showErrorToast('Erro ao carregar detalhes do Pokémon');
      this.router.navigate(['/tabs/home']);
    } finally {
      this.isLoading = false;
      loading.dismiss();
    }
  }

  /**
   * Toggle favorito
   */
  async toggleFavorite(event: Event) {
    event.stopPropagation();

    if (!this.pokemon) return;

    const isFavorite = this.pokemonService.isFavorite(this.pokemon.id);

    if (isFavorite) {
      this.pokemonService.removeFromFavorites(this.pokemon.id);
      this.showToast(
        `${this.capitalize(this.pokemon.name)} removido dos favoritos`
      );
    } else {
      this.pokemonService.addToFavorites(this.pokemon);
      this.showToast(
        `${this.capitalize(this.pokemon.name)} adicionado aos favoritos`
      );
    }
  }

  /**
   * Verifica se Pokémon é favorito
   */
  isFavorite(): boolean {
    return this.pokemon
      ? this.pokemonService.isFavorite(this.pokemon.id)
      : false;
  }

  /**
   * Obtém a melhor imagem do Pokémon
   */
  getPokemonImage(): string {
    if (!this.pokemon) return 'assets/pokemon-placeholder.png';

    return (
      this.pokemon.sprites.other['official-artwork'].front_default ||
      this.pokemon.sprites.front_default ||
      'assets/pokemon-placeholder.png'
    );
  }

  /**
   * Obtém cor baseada no tipo principal do Pokémon
   */
  getTypeColor(): string {
    if (!this.pokemon) return '#68A090';

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

    const primaryType = this.pokemon.types[0]?.type.name || 'normal';
    return typeColors[primaryType] || '#68A090';
  }

  /**
   * Capitaliza primeira letra
   */
  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Obtém o nome do ícone para cada stat
   */
  getStatIcon(statName: string): string {
    const iconMap: { [key: string]: string } = {
      hp: 'heart',
      attack: 'flash',
      defense: 'shield',
      'special-attack': 'barbell',
      'special-defense': 'resize',
      speed: 'speedometer',
    };
    return iconMap[statName] || 'stats-chart';
  }

  /**
   * Obtém cor da barra de progresso baseada no valor da stat e no tipo da stat
   */
  getStatColor(statValue: number, statName?: string): string {
    const statColors: { [key: string]: string } = {
      hp: '#FF6B6B',
      attack: '#FF8E53',
      defense: '#4ECDC4',
      'special-attack': '#A78BFA',
      'special-defense': '#34D399',
      speed: '#FBBF24',
    };

    if (statName && statColors[statName]) {
      return statColors[statName];
    }

    if (statValue >= 120) return '#10B981';
    if (statValue >= 100) return '#34D399';
    if (statValue >= 80) return '#FBBF24';
    if (statValue >= 60) return '#FB923C';
    if (statValue >= 40) return '#F87171';
    return '#EF4444';
  }

  /**
   * Obtém a porcentagem da barra baseada no valor da stat
   * Usa uma escala mais realista para stats de Pokémon
   */
  getStatPercentage(statValue: number): number {
    const maxStat = 200;
    const percentage = Math.min((statValue / maxStat) * 100, 100);
    return Math.max(percentage, 5);
  }

  /**
   * Obtém classificação da stat baseada no valor
   */
  getStatRating(statValue: number): string {
    if (statValue >= 150) return 'Lendário';
    if (statValue >= 120) return 'Excelente';
    if (statValue >= 100) return 'Muito Bom';
    if (statValue >= 80) return 'Bom';
    if (statValue >= 60) return 'Regular';
    if (statValue >= 40) return 'Baixo';
    return 'Muito Baixo';
  }

  /**
   * Obtém nome traduzido da stat
   */
  getStatDisplayName(statName: string): string {
    const statNames: { [key: string]: string } = {
      hp: 'HP',
      attack: 'Ataque',
      defense: 'Defesa',
      'special-attack': 'At. Especial',
      'special-defense': 'Def. Especial',
      speed: 'Velocidade',
    };
    return statNames[statName] || statName;
  }

  /**
   * Converte altura de decímetros para metros
   */
  getHeightInMeters(): string {
    if (!this.pokemon) return '0.0';
    return (this.pokemon.height / 10).toFixed(1);
  }

  /**
   * Converte peso de hectogramas para quilogramas
   */
  getWeightInKg(): string {
    if (!this.pokemon) return '0.0';
    return (this.pokemon.weight / 10).toFixed(1);
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
