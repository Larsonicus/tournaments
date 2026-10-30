import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import HomeView from '@/views/HomeView.vue';

describe('HomeView', () => {
  it('renders title', () => {
    expect(mount(HomeView).find('h1').text()).toBe('Tournaments');
  });
});
