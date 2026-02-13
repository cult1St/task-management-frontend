
 // for vertical sliding
const slider = document.querySelector('.overflow-y-scroll');
slider.addEventListener('wheel', (event) => {
event.preventDefault();
slider.scrollBy({
    top: event.deltaY,
    behavior: 'smooth'
});
});


//for dropdown
function toggleDropdown(button) {
    const dropdown = button.nextElementSibling;
    dropdown.classList.toggle('hidden');
  }

  document.getElementById('chat-link').addEventListener('click', function(event) {
    event.preventDefault();
    showTab('chat', 'chat-link');
  });

  document.getElementById('profile-link').addEventListener('click', function(event) {
    event.preventDefault();
    showTab('profile', 'profile-link');
  });

  document.getElementById('group-link').addEventListener('click', function(event) {
    event.preventDefault();
    showTab('group', 'group-link');
  });

  document.getElementById('contact-link').addEventListener('click', function(event) {
    event.preventDefault();
    showTab('contact', 'contact-link');
  });

  document.getElementById('setting-link').addEventListener('click', function(event) {
    event.preventDefault();
    showTab('setting', 'setting-link');
  });


  //for showing tabs and pushing it to the url
  function showTab(contentId, linkId) {
    document.getElementById('chat').classList.add('hidden');
    document.getElementById('profile').classList.add('hidden');
    document.getElementById('group').classList.add('hidden');
    document.getElementById('contact').classList.add('hidden');
    document.getElementById('setting').classList.add('hidden');
    
    document.getElementById(contentId).classList.remove('hidden');

    document.getElementById('chat-link').classList.remove('icon-link2');
    document.getElementById('profile-link').classList.remove('icon-link2');
    document.getElementById('group-link').classList.remove('icon-link2');
    document.getElementById('contact-link').classList.remove('icon-link2');
    document.getElementById('setting-link').classList.remove('icon-link2');

    document.getElementById(linkId).classList.add('icon-link2');

    history.pushState(null, '', `#${contentId}`);
  }
  window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      showTab(hash, `${hash}-link`);
    } else {
      showTab('chat', 'chat-link');
    }
  });


  // for modals
    document.getElementById('modalbutton').addEventListener('click', function() {
        document.getElementById('modal').classList.remove('hidden');
    });

    document.getElementById('closemodalbutton').addEventListener('click', function() {
        document.getElementById('modal').classList.add('hidden');
    });

    document.getElementById('modalbutton2').addEventListener('click', function() {
      document.getElementById('modal2').classList.remove('hidden');
  });

  document.getElementById('closemodalbutton2').addEventListener('click', function() {
      document.getElementById('modal2').classList.add('hidden');
  });

  document.getElementById('modalbutton3').addEventListener('click', function() {
    document.getElementById('modal3').classList.remove('hidden');
});

document.getElementById('closemodalbutton3').addEventListener('click', function() {
    document.getElementById('modal3').classList.add('hidden');
});


//for emoji
const emoji_container = document.querySelector('.emoji-container');
const emoji = document.querySelector('.emoji');

document.getElementById('emoji-button').addEventListener('click', function() {
  if (emoji_container.classList.contains('h-20')) {
    emoji_container.classList.remove('h-20');
    emoji_container.classList.add('h-64');
    emoji.classList.remove('hidden');
  } else {
    emoji_container.classList.remove('h-64');
    emoji_container.classList.add('h-20');
    emoji.classList.add('hidden');
  }
});

//for light / dark mode

// // script.js
// document.getElementById('toggleDarkMode').addEventListener('click', function() {
//   document.getElementById('toggleDarkMode').classList.toggle('bx-moon');
//   // document.documentElement.classList.toggle('dark');
//   document.getElementById('toggleDarkMode').classList.toggle('bx-sun');
// });


// script.js
// document.addEventListener('DOMContentLoaded', (event) => {
//   const button = document.getElementById('toggleDarkMode');
//   const darkMode = localStorage.getItem('darkMode');

//   if (darkMode === 'enabled') {
//     document.documentElement.classList.add('dark');
//     button.classList.remove('bx-moon');
//     button.classList.add('bx-sun');
//   }

//   button.addEventListener('click', function() {
//     document.documentElement.classList.toggle('dark');
//     if (document.documentElement.classList.contains('dark')) {
//       localStorage.setItem('darkMode', 'enabled');
//       button.classList.remove('bx-moon');
//       button.classList.add('bx-sun');
//     } else {
//       localStorage.setItem('darkMode', 'disabled');
//       button.classList.remove('bx-sun');
//       button.classList.add('bx-moon');
//     }
//   });
// });


