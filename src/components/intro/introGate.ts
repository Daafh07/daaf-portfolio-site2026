import { INTRO } from "./introConfig";

// Runs inline in <head>, before the first paint. It decides whether the intro plays by setting
// <html data-intro="playing">. CSS then shows the curtain and hides the hero targets, so there is
// no flash. Plays on the homepage only, once per session (again on reload), never with reduced motion.
// With the slingshot game, except when the logo in the menu asked for it: then only the letters,
// and <html data-intro-game> is not set. Demo mode (?demo, for an open day) plays the letters on every
// load, without the game: the game waits for a click, and the demo has to run on its own.
export const introGateScript = `(function(){try{
var d=document.documentElement;
if(location.pathname!=="/")return;
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var k=${JSON.stringify(INTRO.storageKey)},r=${JSON.stringify(INTRO.replayKey)},n=performance.getEntriesByType("navigation")[0];
var t=+sessionStorage.getItem(r),replay=t>0&&Date.now()-t<${INTRO.replayWindow},demo=/[?&]demo(=|&|$)/.test(location.search);
sessionStorage.removeItem(r);
if(sessionStorage.getItem(k)&&!replay&&!demo&&!(n&&n.type==="reload"))return;
sessionStorage.setItem(k,"1");
d.dataset.intro="playing";
if(!replay&&!demo)d.dataset.introGame="";
history.scrollRestoration="manual";
window.scrollTo(0,0);
}catch(e){}})();`;
