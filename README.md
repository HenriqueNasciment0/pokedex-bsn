# Pokedex com Ionic Angular 🚀

![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

Uma Pokedex moderna e elegante desenvolvida com Ionic Angular usando componentes standalone.

**🔗 Acesse a aplicação:** [https://pokedex-bsn.vercel.app/tabs/home](https://pokedex-bsn.vercel.app/tabs/home)

## ✨ Recursos Principais

- **Scroll Infinito Inteligente**: Carregamento controlado de 20 Pokémons por vez enquanto você rola
- **Tema Escuro Premium**: Design minimalista com efeitos gradientes modernos
- **Sistema de Favoritos**: Salve seus Pokémons favoritos com armazenamento local
- **Detalhes Ricos**: Visualização completa de atributos e imagens em alta qualidade
- **Navegação Fluida**: Transições suaves entre Home e Favoritos
- **Responsividade**: Layout otimizado para qualquer dispositivo

## ⚡ Tecnologias Utilizadas

- **Ionic Angular** com componentes standalone
- **Scroll Infinito** com carregamento otimizado
- **Armazenamento Local** para persistência de favoritos
- **Design System** com cores dinâmicas baseadas nos tipos Pokémon
- **Toasts Interativos** para feedback de ações
- **Deploy Automatizado** na Vercel

## 🎨 Design Destaque

```typescript
getTypeColor(pokemon: Pokemon): string {
  const typeColors: { [key: string]: string } = {
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    // ... e outros tipos com cores personalizadas
  };
  return typeColors[primaryType] || '#68A090';
}
```

## ⚙️ Executando Localmente

```bash
# Clone o repositório
git clone https://github.com/HenriqueNasciment0/pokedex-bsn.git

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
ionic serve
```

---

Feito com ❤️ e Pokébolas! **Gotta catch 'em all!**
