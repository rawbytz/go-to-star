// ==UserScript==
// @name         WorkFlowy Go To Starred Page
// @namespace    https://rawbytz.wordpress.com
// @version      3.0
// @description  Option to WorkFlowy's Starred pages picker. Activate with ALT+S.
// @author       rawbytz
// @match        https://workflowy.com/*
// @match        https://beta.workflowy.com/*
// @updateUrl    https://github.com/rawbytz/go-to-star/raw/master/goToStar.user.js
// @downloadUrl  https://github.com/rawbytz/go-to-star/raw/master/goToStar.user.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';
  function goToStar() {
    function toastMsg(str, sec, err) {
      WF.showMessage(str, err);
      setTimeout(WF.hideMessage, (sec || 2) * 1000);
    }
    function getStarredURL(star) {
      const base = star.item.getUrl();
      const query = star.search ? `?q=${encodeURIComponent(star.search)}` : "";
      return `${base === "/" ? base + '#' : base}${query}`
    }
    function getStarName(star) {
      const name = star.item.getNameInPlainText();
      const query = star.search ? ` ⌕ ${star.search}` : ""; // 🔍
      return name + query
    }
    const htmlEscText = str => str.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    function createSelectBox_Star(stars) {
      function getFontSize(num) {
        if (num < 44) return 14;
        else if (num < 48) return 13;
        else if (num < 51) return 12;
        else if (num < 56) return 11;
        else if (num < 61) return 10;
        else return 9;
      }
      function darkStyle(theme) {
        if (theme === "dark" || theme === "space") return "background: rgb(42, 49, 53);color: white;"
        if (theme === "hacker") return "background: rgb(0, 0, 0);color: rgb(0, 255, 0);"
        return ""
      }
      const settings = JSON.parse(localStorage.getItem('userstorage.settings'));
      const theme = settings ? settings.theme : undefined;
      const options = stars.map(star => `<option value="${getStarredURL(star)}">${htmlEscText(getStarName(star))}</option>`);
      const l = options.length;
      const style = `<style>select{font-size:${getFontSize(l)}px;border:hidden;margin-top:6px;width:460px;${darkStyle(theme)}}select::-webkit-scrollbar{display:none!important}option::before{content:"●  "!important;color:#c6c6c6!important}h1{font-size:120%!important}</style>`;
      return `${style}<select id="starSelect" size="${l}">${options.join('')}</select>`;
    }
    function goAndHide(url) {
      location.href = url;
      WF.hideDialog();
    }
    const stars = WF.starredLocations().filter(star => !star.item.isWithinCompleted());
    if (stars.length === 0) return void toastMsg("No starred pages found.", 3, true);
    if (stars.length === 1) return void WF.zoomTo(stars[0].item);
    WF.showAlertDialog(createSelectBox_Star(stars));
    setTimeout(function () {
      const starSelect = document.getElementById("starSelect");
      starSelect.selectedIndex = '0';
      starSelect.focus();
      starSelect.onclick = function () { goAndHide(this.value) };
      starSelect.onkeyup = function (e) { if (e.key === "Enter") goAndHide(this.value) };
    }, 100);
  }

  document.addEventListener("keydown", function (event) { // Alt+s 
    if (event.altKey && !event.ctrlKey && !event.shiftKey && !event.metaKey && event.key === "s") { 
      goToStar();
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });
})();