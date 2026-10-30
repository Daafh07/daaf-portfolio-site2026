import { INTRO } from "./introConfig";

// Runs inline in <head>, before the first paint. It decides whether the intro plays by setting
// <html data-intro="playing">. CSS then shows the curtain and hides the hero targets, so there is
// no flash. Plays on the homepage only, once per session (again on reload), never with reduced motion.
export const introGateScript = `(function(){try{
var d=document.documentElement;
if(location.pathname!=="/")return;
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var k=${JSON.stringify(INTRO.storageKey)},n=performance.getEntriesByType("navigation")[0];
if(sessionStorage.getItem(k)&&!(n&&n.type==="reload"))return;
sessionStorage.setItem(k,"1");
d.dataset.intro="playing";
history.scrollRestoration="manual";
window.scrollTo(0,0);
}catch(e){}})();`;
