import { orderBy } from 'lodash'

export default class Card {
  constructor(card) {
    this.card = card
  }

  static getImageUrl(card) {
    if (card.flipMultiverseid) {
      return `${process.env.MTG_IMAGE_URL}/api/v1/images?multiverseid=${card.multiverseid}&multiverseid=${card.flipMultiverseid}`
    }
    return `${process.env.MTG_IMAGE_URL}/api/v1/images?multiverseid=${card.multiverseid}`
  }

  static formatOwnedBy(card) {
    const sortedCards = orderBy(card.ownedBy, 'ownedCount', 'desc')
    return sortedCards.map(user => `${user.username}: ${user.ownedCount} || ${user.blocks.join(', ')}`).join('\n')
  }

  static createLinks(card) {
    const mcmLink = `<https://en.magiccardmarket.eu/?mainPage=showSearchResult&searchFor=${encodeURIComponent(card.name)}|MagicCardMarket>`
    const scryfallLink = `<https://scryfall.com/search?q=${encodeURIComponent(card.name)}|Scryfall>`
    return `${mcmLink} | ${scryfallLink}`
  }

  toSlackAttachment() {
    const { card } = this
    const slackAttachment = {
      title: card.displayName,
      title_link: `http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=${card.multiverseid}`,
      image_url: Card.getImageUrl(card),
      footer: Card.formatOwnedBy(card),
    }
    const textRows = [Card.createLinks(card)]
    if (card.price) {
      const priceFrom = `Price from ${card.price.priceLowExMin}€ (${card.price.priceLowExMinBlocks.join(', ')})`
      textRows.push(priceFrom)
    }
    slackAttachment.text = textRows.join('\n')
    return slackAttachment
  }
}
