import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'lib-ui-app-footer',
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-black text-white py-12">
      <div class="max-w-7xl mx-auto px-6 md:px-10">
        <!-- Footer Grid -->
        <div class="grid grid-cols-5 gap-8 mb-12">
          <!-- Logo Column -->
          <div class="col-span-1">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 8C17.1046 8 18 7.10457 18 6C18 4.89543 17.1046 4 16 4C14.8954 4 14 4.89543 14 6C14 7.10457 14.8954 8 16 8Z" fill="white"/>
              <path d="M16 20V9" stroke="white" stroke-width="2"/>
              <path d="M8 12C9.10457 12 10 11.1046 10 10C10 8.89543 9.10457 8 8 8C6.89543 8 6 8.89543 6 10C6 11.1046 6.89543 12 8 12Z" fill="white"/>
              <path d="M8 20V13" stroke="white" stroke-width="2"/>
            </svg>
            <p class="text-sm font-semibold mt-2">TikTok</p>
          </div>

          <!-- Company -->
          <div>
            <h3 class="font-semibold mb-4">Company</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#" class="hover:text-white transition">About TikTok</a></li>
              <li><a href="#" class="hover:text-white transition">Newsroom</a></li>
              <li><a href="#" class="hover:text-white transition">Contact</a></li>
              <li><a href="#" class="hover:text-white transition">Careers</a></li>
              <li><a href="#" class="hover:text-white transition">ByteDance</a></li>
            </ul>
          </div>

          <!-- Programs -->
          <div>
            <h3 class="font-semibold mb-4">Programs</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#" class="hover:text-white transition">TikTok for Good</a></li>
              <li><a href="#" class="hover:text-white transition">TikTok for Developers</a></li>
              <li><a href="#" class="hover:text-white transition">Effect House</a></li>
              <li><a href="#" class="hover:text-white transition">Advertise on TikTok</a></li>
              <li><a href="#" class="hover:text-white transition">TikTok Embeds</a></li>
            </ul>
          </div>

          <!-- Resources -->
          <div>
            <h3 class="font-semibold mb-4">Resources</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#" class="hover:text-white transition">Help Center</a></li>
              <li><a href="#" class="hover:text-white transition">Safety Center</a></li>
              <li><a href="#" class="hover:text-white transition">Privacy Center</a></li>
              <li><a href="#" class="hover:text-white transition">Creator Academy</a></li>
              <li><a href="#" class="hover:text-white transition">Community Guidelines</a></li>
              <li><a href="#" class="hover:text-white transition">Transparency</a></li>
              <li><a href="#" class="hover:text-white transition">Accessibility</a></li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h3 class="font-semibold mb-4">Legal</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#" class="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" class="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-white transition">Intellectual Property Policy</a></li>
              <li><a href="#" class="hover:text-white transition">Law Enforcement Guidelines</a></li>
            </ul>
          </div>
        </div>

        <!-- Divider -->
        <hr class="border-gray-800 mb-6">

        <!-- Copyright -->
        <div class="text-right">
          <p class="text-xs text-gray-500">© 2026 Reals</p>
        </div>
      </div>
    </footer>
  `,
})
export class UiAppFooter {}
