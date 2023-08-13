
// import NDK from '@nostr-dev-kit/ndk';
// import { NDKEvent } from '@nostr-dev-kit/ndk';

// const ndk = new NDK({
//     explicitRelayUrls: ['wss://indextr.com']
// });
// interface Event {
//     id: string,
//     pubkey: string,
//     created_at: number,
//     kind: number,
//     content: string,
// }
// export const load = async ({ fetch }) => {
//     const fetchProducts = async () => {
//         const productRes = await fetch('https://dummyjson.com/products?limit=10')
//         const productData: any = await productRes.json()
//         return productData.products
//     }
//     const fetchUsers = async () => {
//         const userRes = await fetch('https://dummyjson.com/users?limit=10')
//         const userData: any = await userRes.json()
//         return userData.users
//     }
//     return {
//         products: await fetchProducts(),
//         users: await fetchUsers(),
//     }

// }


// // export const load = async () => {
// //     return {
// //         events: [{
// //             id: "arpbe",
// //             pubkey: "npub446548",
// //             created_at: 1626712800,
// //             kind: 30040,
// //             content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl vitae aliquam ultricies, nunc nisl ultrici",
// //         },
// //         {
// //             id: "arstao4813",
// //             pubkey: "npub446ra465",
// //             created_at: 1626712800,
// //             kind: 30040,
// //             content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl vitae aliquam ultricies, nunc nisl ultrici",
// //         },
// //         ]
// //     }

//     // const eventsPromise: Promise<Set<NDKEvent>> = await ndk.fetchEvents({ kinds: [30040] });
//     // const events = await eventsPromise;
//     // console.log(events);
//     // const eventsArray = Array.from(events);
//     // console.log(eventsArray);
//     // const eventsArraySorted = eventsArray.sort((a, b) => b.timestamp - a.timestamp);
//     // console.log(eventsArraySorted);
//     // const eventsArraySortedFiltered = eventsArraySorted.filter((event) => event.data?.tok
// };
