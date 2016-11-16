import { VodWithMePage } from './app.po';

describe('vod-with-me App', function() {
  let page: VodWithMePage;

  beforeEach(() => {
    page = new VodWithMePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
