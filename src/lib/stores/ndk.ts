import NDK from '@nostr-dev-kit/ndk';
const ndk = new NDK({
    explicitRelayUrls: ['wss://indextr.com']
})
export default ndk;
// export function load({ event }) {
//     return { event };
// }
