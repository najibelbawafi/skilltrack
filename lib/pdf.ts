
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export async function downloadElementAsPDF(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  if (!element) {
    throw new Error("Elemen CV tidak ditemukan.");
  }

  const clone = element.cloneNode(true) as HTMLElement;

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = `${Math.max(element.scrollWidth, 794)}px`;
  wrapper.style.backgroundColor = "#FFFFFF";
  wrapper.style.zIndex = "-1";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const originalElements = [
      element,
      ...Array.from(element.querySelectorAll("*")),
    ];

    const clonedElements = [
      clone,
      ...Array.from(clone.querySelectorAll("*")),
    ];

    originalElements.forEach((original, index) => {
      const copied = clonedElements[index] as HTMLElement;
      const computed = window.getComputedStyle(original);

      const properties = [
        "color",
        "backgroundColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "outlineColor",
        "textDecorationColor",
        "boxShadow",
      ];

      properties.forEach((property) => {
        const cssProperty = property.replace(
          /[A-Z]/g,
          (letter) => `-${letter.toLowerCase()}`
        );

        const value = computed.getPropertyValue(cssProperty);

        if (value) {
          copied.style.setProperty(cssProperty, value);
        }
      });
    });

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#FFFFFF",
      logging: false,
      imageTimeout: 15000,
      width: clone.scrollWidth,
      height: clone.scrollHeight,
      windowWidth: Math.max(clone.scrollWidth, 794),
      windowHeight: clone.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("Gagal membuat gambar CV.");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pdf.internal.pageSize.getHeight() - margin * 2;

    const pxPerMm = canvas.width / contentWidth;
    const pagePixelHeight = Math.floor(contentHeight * pxPerMm);

    let sourceY = 0;
    let pageNumber = 0;

    while (sourceY < canvas.height) {
      const sliceHeight = Math.min(
        pagePixelHeight,
        canvas.height - sourceY
      );

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const context = pageCanvas.getContext("2d");

      if (!context) {
        throw new Error("Gagal memproses halaman PDF.");
      }

      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      const imageData = pageCanvas.toDataURL("image/jpeg", 0.95);
      const imageHeight = sliceHeight / pxPerMm;

      if (pageNumber > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        imageData,
        "JPEG",
        margin,
        margin,
        contentWidth,
        imageHeight,
        undefined,
        "FAST"
      );

      sourceY += sliceHeight;
      pageNumber++;
    }

    pdf.save(fileName);
  } finally {
    document.body.removeChild(wrapper);
  }
}
