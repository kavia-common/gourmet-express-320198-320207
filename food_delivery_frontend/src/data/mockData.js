/**
 * Mock / fallback data for when backend endpoints are unavailable.
 * This is intentionally small but complete enough to drive the UI flows.
 */

export const categories = ["All", "Pizza", "Burgers", "Sushi", "Healthy", "Dessert", "Indian"];

export const mockRestaurants = [
  {
    id: "r_pizza_harbor",
    name: "Pizza Harbor",
    category: "Pizza",
    rating: 4.7,
    etaMinutes: 25,
    fee: 2.49,
    priceLevel: "$$",
    tags: ["Wood-fired", "Family"],
  },
  {
    id: "r_blue_burger",
    name: "Blue Burger Co.",
    category: "Burgers",
    rating: 4.5,
    etaMinutes: 20,
    fee: 1.99,
    priceLevel: "$",
    tags: ["Smash", "Fries"],
  },
  {
    id: "r_sushi_current",
    name: "Sushi Current",
    category: "Sushi",
    rating: 4.8,
    etaMinutes: 35,
    fee: 3.99,
    priceLevel: "$$$",
    tags: ["Omakase", "Fresh"],
  },
  {
    id: "r_green_bowl",
    name: "Green Bowl",
    category: "Healthy",
    rating: 4.6,
    etaMinutes: 18,
    fee: 1.49,
    priceLevel: "$$",
    tags: ["Vegan", "Gluten-free"],
  },
  {
    id: "r_saffron_route",
    name: "Saffron Route",
    category: "Indian",
    rating: 4.4,
    etaMinutes: 30,
    fee: 2.99,
    priceLevel: "$$",
    tags: ["Spicy", "Curry"],
  },
  {
    id: "r_amber_desserts",
    name: "Amber Desserts",
    category: "Dessert",
    rating: 4.9,
    etaMinutes: 15,
    fee: 1.25,
    priceLevel: "$$",
    tags: ["Gelato", "Pastries"],
  },
];

export const mockMenusByRestaurantId = {
  r_pizza_harbor: [
    { id: "m_ph_1", name: "Margherita", desc: "Tomato, basil, mozzarella.", price: 12.5 },
    { id: "m_ph_2", name: "Pepperoni", desc: "Classic pepperoni & cheese.", price: 14.0 },
    { id: "m_ph_3", name: "Truffle Mushroom", desc: "Mushroom, truffle oil, parmesan.", price: 16.5 },
  ],
  r_blue_burger: [
    { id: "m_bb_1", name: "Classic Smash", desc: "Two patties, cheddar, pickles.", price: 11.0 },
    { id: "m_bb_2", name: "Ocean BBQ", desc: "BBQ sauce, onions, bacon.", price: 13.5 },
    { id: "m_bb_3", name: "Crispy Fries", desc: "Sea-salt fries, house dip.", price: 4.5 },
  ],
  r_sushi_current: [
    { id: "m_sc_1", name: "Salmon Nigiri (6)", desc: "Silky salmon over sushi rice.", price: 15.0 },
    { id: "m_sc_2", name: "Spicy Tuna Roll", desc: "Tuna, chili, cucumber.", price: 12.0 },
    { id: "m_sc_3", name: "Miso Soup", desc: "Tofu, wakame, scallion.", price: 3.5 },
  ],
  r_green_bowl: [
    { id: "m_gb_1", name: "Power Bowl", desc: "Quinoa, chickpeas, avocado.", price: 12.0 },
    { id: "m_gb_2", name: "Chicken Caesar", desc: "Romaine, parmesan, croutons.", price: 11.5 },
    { id: "m_gb_3", name: "Cold Pressed Juice", desc: "Citrus + ginger blend.", price: 6.0 },
  ],
  r_saffron_route: [
    { id: "m_sr_1", name: "Butter Chicken", desc: "Creamy tomato sauce.", price: 14.5 },
    { id: "m_sr_2", name: "Chana Masala", desc: "Spiced chickpea curry.", price: 12.0 },
    { id: "m_sr_3", name: "Garlic Naan", desc: "Fresh baked naan bread.", price: 3.0 },
  ],
  r_amber_desserts: [
    { id: "m_ad_1", name: "Gelato Trio", desc: "Pick any three flavors.", price: 9.5 },
    { id: "m_ad_2", name: "Almond Croissant", desc: "Buttery, flaky, filled.", price: 4.75 },
    { id: "m_ad_3", name: "Chocolate Mousse", desc: "Rich and airy.", price: 6.25 },
  ],
};

/**
 * PUBLIC_INTERFACE
 * Create a mock order with a deterministic-ish id.
 * @param {{items: Array, restaurant: object, address: object}} input
 * @returns {{id: string, createdAt: string}}
 */
export function createMockOrder(input) {
  const id = `ord_${Math.random().toString(16).slice(2, 8)}${Date.now().toString(16).slice(-4)}`;
  return { id, createdAt: new Date().toISOString(), ...input };
}

/**
 * PUBLIC_INTERFACE
 * Generate mock tracking steps based on minutes elapsed.
 * @param {number} elapsedMinutes
 * @returns {{key: string, title: string, meta: string, active: boolean}[]}
 */
export function getMockTrackingSteps(elapsedMinutes) {
  const steps = [
    { key: "confirmed", title: "Order confirmed", threshold: 0, meta: "We’re preparing your order." },
    { key: "preparing", title: "Preparing", threshold: 4, meta: "The kitchen is working on it." },
    { key: "picked_up", title: "Picked up", threshold: 10, meta: "Courier is on the way." },
    { key: "delivered", title: "Delivered", threshold: 18, meta: "Enjoy your meal!" },
  ];

  const currentIndex = steps.reduce((acc, s, idx) => (elapsedMinutes >= s.threshold ? idx : acc), 0);

  return steps.map((s, idx) => ({
    key: s.key,
    title: s.title,
    meta: s.meta,
    active: idx <= currentIndex,
  }));
}
