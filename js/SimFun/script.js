window.addEventListener("load", main, false);

function main () {
	var theCanvas = document.getElementById("canvasOne");//获取canvas实例
	var context = theCanvas.getContext("2d");//获取2D绘图环境操作接口
	context.stokeStyle = "red";//线条颜色设定为红色red

	context.beginPath();//开始绘制路径
	context.moveTo(20, 10); // move to
	context.lineTo(40, 200); // line to
	context.lineTo(140, 180); // line to
	context.stroke();//显示路径

	context.fillStyle = 'green';//设置填充颜色为绿
	context.fillRect(90, 40, 180, 90); //绘制矩形并设定其左上角坐标及长宽

	context.font = '28px microsoft yahei';//设置字体及大小
	context.fillText('By Soong', 100, 30);
}