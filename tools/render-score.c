/* Build dependency: TinySoundFont (MIT), https://github.com/schellingb/TinySoundFont.
 * cc -O2 -I/path/to/TinySoundFont tools/render-score.c -lm -o /tmp/render-score
 * /tmp/render-score /path/to/GeneralUser-GS.sf2 /tmp/events.txt /tmp/jazz.f32
 */
#define TSF_IMPLEMENTATION
#include "tsf.h"
#include <stdio.h>
#include <stdlib.h>
int main(int argc,char**argv){
 if(argc!=4)return 2;
 tsf*f=tsf_load_filename(argv[1]);if(!f)return 3;
 tsf_set_output(f,TSF_STEREO_INTERLEAVED,44100,-6.0f);tsf_set_max_voices(f,128);
 int prog[]={0,32,56,66,24,61};float vol[]={.70f,1.0f,.65f,.70f,.42f,.42f};float pan[]={.32f,.49f,.58f,.40f,.70f,.65f};
 for(int c=0;c<6;c++){tsf_channel_set_presetnumber(f,c,prog[c],0);tsf_channel_set_volume(f,c,vol[c]);tsf_channel_set_pan(f,c,pan[c]);}
 tsf_channel_set_presetnumber(f,9,0,1);tsf_channel_set_volume(f,9,.78f);
 FILE*in=fopen(argv[2],"r"),*out=fopen(argv[3],"wb");if(!in||!out)return 4;
 int at,type,ch,key,velocity,cur=0;float buf[1024*2];
 while(fscanf(in,"%d %d %d %d %d",&at,&type,&ch,&key,&velocity)==5){
  while(cur<at){int n=at-cur;if(n>1024)n=1024;tsf_render_float(f,buf,n,0);fwrite(buf,sizeof(float),n*2,out);cur+=n;}
  if(type)tsf_channel_note_on(f,ch,key,velocity/127.0f);else tsf_channel_note_off(f,ch,key);
 }
 int end=(int)(128*60.0/196*44100)+44100*2;
 while(cur<end){int n=end-cur;if(n>1024)n=1024;tsf_render_float(f,buf,n,0);fwrite(buf,sizeof(float),n*2,out);cur+=n;}
 fclose(in);fclose(out);tsf_close(f);return 0;
}
