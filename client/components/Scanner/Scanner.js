import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";
import _ from "lodash";
import { Label, Button } from "semantic-ui-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
const codeReader = new BrowserMultiFormatReader();

@inject("router", "db", "actions")
@observer
class Scanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: null,
      hasTorchButton: false,
      hasZoomButton: false,
      torch: false,
      zoomed: false,
      maxZoom: 0,
      minZoom: 0,
      track: null,
    };
    this.video = createRef();
  }

  toggleZoom = () => {
    const track = this.state.track;
    if (track) {
      if (this.state.zoomed === false) {
        track.applyConstraints({
          advanced: [{ zoom: this.state.maxZoom }],
        });
        this.setState({ zoomed: true });
      } else {
        track.applyConstraints({
          advanced: [{ zoom: this.state.minZoom }],
        });
        this.setState({ zoomed: false });
      }
    }
  };

  toggleTorch = () => {
    const track = this.state.track;

    if (track) {
      track.applyConstraints({
        advanced: [{ torch: !this.state.torch }],
      });
      this.setState({ torch: !this.state.torch });
    }
  };

  scanBarcode = () => {
    const self = this;
    navigator.mediaDevices
      .getUserMedia({
        video: { zoom: true, facingMode: { exact: "environment" } },
        audio: false,
      })
      .then(function (stream) {
        const track = stream.getVideoTracks()[0];
        self.setState({
          track: track,
        });

        const capabilities = track.getCapabilities();
        const settings = track.getSettings();

        if (capabilities.hasOwnProperty("zoom")) {
          self.setState({
            hasZoomButton: true,
            maxZoom: capabilities.zoom.max,
            minZoom: capabilities.zoom.min,
          });
        }

        if (settings.hasOwnProperty("torch")) {
          self.setState({
            hasTorchButton: true,
          });
        }

        console.log({ capabilities, settings });
        console.log("zoom:", capabilities.zoom);

        // video.srcObject = stream;
        // video.play();

        // track.applyConstraints({
        //   advanced: [{ torch: true }],
        // });

        return stream;
      })
      .then((stream) => {
        console.log({ stream });
        codeReader.decodeFromStream(stream, "video", (result, err) => {
          if (result) {
            this.setState({ text: result.text });
            this.props.actions.scanned = result.text;
            this.props.db.getBarcodeInfo(result.text);
            this.close();
            // console.log(result.resultPoints)
            // let context = this.clearOverlay()
            // this.drawResult(context, result.resultPoints, result.text)
            //document.getElementById('result').textContent = result.text
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error(err);
            //document.getElementById('result').textContent = err
          }
        });
      });
  };
  stop() {
    codeReader.reset();
  }
  clearOverlay = () => {
    let {
      width,
      height,

      //
    } = this.props.actions;
    let context = document.getElementById("overlay").getContext("2d");
    let { widthReal } = this.state;
    console.log({ widthReal });
    let left = (widthReal - width) / 2;
    //context.selectAll("*").remove()
    context.clearRect(0, 0, width, height);
    context.strokeStyle = "#F12B2B";
    context.lineWidth = 5;
    return context;
  };

  drawResult = (context, localization, text) => {
    let { width, height } = this.props.actions;
    let { widthReal } = this.state;
    let left = (widthReal - width) / 4;

    context.beginPath();
    context.moveTo(localization[0].x, localization[0].y);
    context.lineTo(localization[1].x, localization[1].y);
    context.lineTo(localization[1].x, localization[1].y + 30);
    context.lineTo(localization[0].x, localization[1].y + 30);
    context.lineTo(localization[0].x, localization[0].y);
    context.stroke();

    context.font = "18px Verdana";
    context.fillStyle = "#F12B2B";
    // let x = [ localization.X1, localization.X2, localization.X3, localization.X4 ];
    // let y = [ localization.Y1, localization.Y2, localization.Y3, localization.Y4 ];
    // x.sort(function(a, b) {
    //   return a - b;
    // });
    // y.sort(function(a, b) {
    //   return b - a;
    // });
    let leftText = localization[0].x;
    let top = localization[0].y - 40;

    context.fillText(text, leftText, top);
  };
  componentDidMount() {
    this.props.actions.scanned = null;
    this.scanBarcode();
  }
  componentWillUnmount() {
    this.stop();
  }
  // componentDidUpdate(prevProps, prevState, snapshot){
  //   let { start, stop } = this.props
  //   if( start && start !== prevProps.start ){
  //     this.scanBarcode()
  //   }
  //   if( stop && stop !== prevProps.stop ){
  //     this.stop()
  //   }
  // }
  close = () => {
    let { close } = this.props;
    close && close();
  };
  render() {
    let { width, height, view } = this.props.actions;
    let { text } = this.state;
    // let widthReal = document.getElementById('video').offsetWidth
    //console.log({width, height});
    let smallSize = width < height ? width : height;
    let bigSize = width > height ? width : height;
    let size = smallSize * 0.8;
    let topSize = view === "landscape" ? 1600 : 1400;

    return (
      <div className="videoview" style={{ width, height }}>
        <div className="videocontainer">
          <div class="player-buttons" style={{ zIndex: 100, width: "100%", position: "absolute" }}>
            {this.state.hasTorchButton && (
              <button onClick={this.toggleTorch}>{this.state.torch ? "выключить подсветку" : "подсветить"}</button>
            )}
            {this.state.hasZoomButton && (
              <button onClick={this.toggleZoom}>{this.state.zoomed ? "отдалить" : "приблизить"}</button>
            )}
          </div>
          <video
            id="video"
            autoPlay
            height={height}
            muted={true}
            playsInline
            ref={(ref) => {
              this.video = ref;
            }}
          />
        </div>
        <div
          className="hoverer"
          style={{
            width: size,
            height: size,
            left: -(1400 + size / 2),
            top: -(1400 - height / 2 + size / 2),
          }}
        >
          <div>
            {text && text.length > 0 && (
              <Label color="blue" size="big">
                {_.capitalize(text)}
              </Label>
            )}
          </div>
        </div>
        <Button onClick={this.close} fluid color="blue" style={{ zIndex: 100 }}>
          Отмена
        </Button>
      </div>
    );
  }
}
export default Scanner;
