{
  description = "Replit development environment";

  deps = {
    pkgs = import <nixpkgs> { };
  };

  env = {
    packages = with deps.pkgs; [
      nodejs
      nodePackages.typescript
      ffmpeg_7-headless
    ];
  };
}
